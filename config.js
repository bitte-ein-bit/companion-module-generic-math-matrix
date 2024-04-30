const { Regex } = require('@companion-module/base')
const { SCENE_COUNT, SCENE_REGEX } = require('./constants.js')

function getConfigFields() {
    // Valid scene regex
    // Syntax is <startchannel:>value1 value2 value3 startchannel2:value4 value5 value6
    // e.g. 1:255 32 23 34 45:44 3 4
    // this would set channel 1 to 255, channel 2 to 32, channel 3 to 23, channel 4 to 34, channel 45 to 44, channel 46 to 3 and channel 47 to 4
    config = [

        {
            type: 'textinput',
            id: 'output_channels',
            label: `Channels that are handled (e.g. "1-5,34,100-130")`,
            width: 6,
            default: '1-512',
            regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
        },
        {
            type: 'textinput',
            id: 'non-fade-channels-pre',
            label: `Channels that are handled as non-fade channels (e.g. "1-5,34,100-130"), output as pre-fade`,
            width: 6,
            default: '',
            optional: true,
            regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
        },
        {
            type: 'textinput',
            id: 'non-fade-channels-post',
            label: `Channels that are handled as non-fade channels (e.g. "1-5,34,100-130"), output as post-fade`,
            width: 6,
            default: '',
            optional: true,
            regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
        },
        {
            type: 'textinput',
            id: 'secondary-dimmer-channels',
            label: `Channels that are handled by the secondary dimmer (e.g. "1-5,34,100-130")`,
            width: 6,
            default: '',
            optional: true,
            regex: '/^(([0-9]+(-[0-9]+){0,1}),{0,1}){1,}$/',
        },
    ]
    // dynamically add SCENE_COUNT possible scenes
    for (let i = 1; i <= SCENE_COUNT; i++) {
        config.push({
            type: 'textinput',
            id: `scene-${i}-name`,
            label: `Scene ${i} - Bit ${(1<<(i-1))} - Name (not used in module, just for your reference)`,
            width: 12,
            default: '',
            optional: true,
        })
        config.push({
            type: 'textinput',
            id: `scene-${i}`,
            label: `Scene ${i} - Bit ${(1 << (i-1))} - Values (see help for syntax)`,
            width: 12,
            default: '',
            regex: SCENE_REGEX,
            optional: true,
        })
    }
    return config
}

function extractChannelsFromField(self, field) {
    let channels = []

    if (!self.config[field]) {
        return channels
    }
    // if not a string return
    if (typeof self.config[field] !== 'string') {
        return channels
    }
    console.log(field + ' ' + self.config[field])
    let parts = self.config[field].split(',')
    parts.forEach(part => {
        console.log(part)
        if (Number(part)) { // single number
            channels.push(Number(part))
        } else {
            // some range <start>-<stop>
            let p = part.split('-')
            for (let i = Number(p[0]); i <= Number(p[1]); i++) {
                channels.push(i)
            }
        }
    })
    return channels
}

function loadScene(self, scene) {
    // check scene object exists
    if (!self.scenes[scene]) {
        self.scenes[scene] = {}
    }
    // check config data
    if (!self.config[`scene-${scene}`]) {
        return
    }
    if (typeof self.config[`scene-${scene}`] !== 'string') {
        return
    }

    // start at channel 1 by default
    let start_channel = 1
    scene_channels = self.config[`scene-${scene}`].split(' ')
    scene_channels.forEach(channel => {
        let channel_parts = channel.split(':')
        if (channel_parts.length == 1) {
            if (self.output_channels.includes(start_channel)) {
                self.scenes[scene][start_channel] = Math.min(Number(channel_parts[0]), 255)
            }
        } else {
            start_channel = Number(channel_parts[0])
            if (self.output_channels.includes(start_channel)) {
                self.scenes[scene][start_channel] = Math.min(Number(channel_parts[1]), 255)
            }
        }
        start_channel++
    })
}

module.exports = {
    getConfigFields,
    extractChannelsFromField,
    loadScene
}
