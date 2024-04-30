// const sacnServer = require('./lib/server.js').server
const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
// const { v4: uuidv4 } = require('uuid')
const { getActionDefinitions } = require('./actions.js')
const { getConfigFields, extractChannelsFromField, loadScene } = require('./config.js')
const { init_variables, update_variables } = require('./variables.js')
// const { Transitions } = require('./transitions.js')
const { SCENE_COUNT } = require('./constants.js')
const { UpgradeScripts } = require('./upgrades.js')

class MathMatrixInstance extends InstanceBase {
    async init(config) {
        this.config = config
        this.setActionDefinitions(getActionDefinitions(this))
        this.bitmask = 0
        this.primary_dimmer = 100
        this.secondary_dimmer = 100
        // set up data with 512 channels and zero as a value
        this.data = {}
        for (let i = 1; i <= 512; i++) {
            this.data[i] = 0
        }
        await this.configUpdated(config)
        init_variables(this)
        this.updateStatus(InstanceStatus.Ok)
    }

    async configUpdated(config) {

        this.config = config
        // extract channels we act on
        this.output_channels = extractChannelsFromField(this, 'output_channels')
        console.log(`output_channels: ${this.output_channels}`)

        // make sure we have the non-fade-channels-pre and non-fade-channels-post keys
        if (!config.hasOwnProperty('non-fade-channels-pre')) {
            config['non-fade-channels-pre'] = []
        }
        if (!config.hasOwnProperty('non-fade-channels-post')) {
            config['non-fade-channels-post'] = []
        }

        // sort the channels 1-512 into pre-fade, post-fade, and fade
        this.pre_fade_channels = extractChannelsFromField(this, 'non-fade-channels-pre')
        this.post_fade_channels = extractChannelsFromField(this, 'non-fade-channels-post')
        this.fade_channels = []
        for (let i = 1; i <= 512; i++) {
            if (!this.pre_fade_channels.includes(i) && !this.post_fade_channels.includes(i)) {
                this.fade_channels.push(i)
            }
        }
        // remove channels that are not in the output channels
        this.pre_fade_channels = this.pre_fade_channels.filter(channel => this.output_channels.includes(channel))
        this.post_fade_channels = this.post_fade_channels.filter(channel => this.output_channels.includes(channel))
        this.fade_channels = this.fade_channels.filter(channel => this.output_channels.includes(channel))

        console.log('pre-fade', this.pre_fade_channels)
        console.log('post-fade', this.post_fade_channels)
        console.log('fade', this.fade_channels)

        // do the same for primary and seconday dimmer channels
        if (!config.hasOwnProperty('secondary-dimmer-channels')) {
            config['secondary-dimmer-channels'] = []
        }
        this.secondary_dimmer_channels = extractChannelsFromField(this, 'secondary-dimmer-channels')
        // remove any channels that are in the pre-fade, post-fade channels or the secondary dimmer channels
        this.primary_dimmer_channels = this.fade_channels.filter(channel => !this.pre_fade_channels.includes(channel) && !this.post_fade_channels.includes(channel) && !this.secondary_dimmer_channels.includes(channel))
        // remove any channels that are in the pre-fade, post-fade channels as these are handeled differently
        this.secondary_dimmer_channels = this.secondary_dimmer_channels.filter(channel => !this.pre_fade_channels.includes(channel) && !this.post_fade_channels.includes(channel))
        console.log('primary dimmer', this.primary_dimmer_channels)
        console.log('secondary dimmer', this.secondary_dimmer_channels)

        // load scenes
        this.scenes = {}
        for (let i = 1; i <= SCENE_COUNT; i++) {
            loadScene(this, i)
        }
        console.log(this.scenes)
    }

    // When module gets deleted
    async destroy() {
        this.terminate()
    }

    // Return config fields for web config
    getConfigFields() {
        return getConfigFields()
    }

    terminate() {
        delete this.data
    }

    updateVariables() {
        console.log('updating variables')
        // loop through the scenes and check which match the bitmask
        // if there is a match, update the data
        let new_data = {}
        for (let channel = 1; channel <= 512; channel++) {
            // check if channel is in output channels
            if (this.output_channels.includes(channel)) {
                new_data[channel] = 0
            }
        }
        for (let scene = 1; scene < SCENE_COUNT; scene++) {
            if (!this.scenes[scene]) {
                continue
            }

            if ((this.bitmask & (1 << (scene - 1))) > 0) {
                console.log('adding scene', scene, '(', (1 << (scene - 1)), ')')
                // get the keys of new_data, those are the only channels we need to update
                Object.keys(new_data).forEach(channel => {
                    // if the channel is in the scene, update it
                    if (this.scenes[scene][channel]) {
                        // if the channel is in a non-fade channel, just set it
                        if (this.pre_fade_channels.includes(Number(channel)) || this.post_fade_channels.includes(Number(channel))) {
                            new_data[channel] = Math.max(this.scenes[scene][channel], new_data[channel])
                        } else if (this.secondary_dimmer_channels.includes(Number(channel))) {
                            new_data[channel] = Math.max(Math.floor(this.scenes[scene][channel] * this.secondary_dimmer / 100), new_data[channel])
                        } else {
                            new_data[channel] = Math.max(Math.floor(this.scenes[scene][channel] * this.primary_dimmer / 100), new_data[channel])
                        }
                    }
                })
            }
        }
        this.data = new_data
        console.log('resulting data', this.data)
        update_variables(this)
    }
}

runEntrypoint(MathMatrixInstance, UpgradeScripts)
