const variables = [
    {
        name: 'pre-fade artnet string',
        variableId: 'artnet_pre_fade_channels',
    },
    {
        name: 'post-fade artnet string',
        variableId: 'artnet_post_fade_channels',
    },
    {
        name: 'fade artnet string',
        variableId: 'artnet_fade',
    },
    {
        name: 'bitmask',
        variableId: 'bitmask',
    }
]

function init_variables(self) {
    self.setVariableDefinitions(variables)
    update_variables(self)
}

function update_variables(self) {
    let values = []
    // build string for pre-fade channels
    // syntax: <channel>,<value>;<channel>,<value>;...
    let pre_fade_channels_string = ''
    for (let i = 0; i < self.pre_fade_channels.length; i++) {
        pre_fade_channels_string += `${self.pre_fade_channels[i]},${self.data[self.pre_fade_channels[i]]};`
    }
    values['artnet_pre_fade_channels'] = pre_fade_channels_string
    // build string for post-fade channels
    // syntax: <channel>,<value>;<channel>,<value>;...
    let post_fade_channels_string = ''
    for (let i = 0; i < self.post_fade_channels.length; i++) {
        post_fade_channels_string += `${self.post_fade_channels[i]},${self.data[self.post_fade_channels[i]]};`
    }
    values['artnet_post_fade_channels'] = post_fade_channels_string
    // build string for fade channels
    // syntax: <channel>,<value>;<channel>,<value>;...
    let fade_string = ''
    for (let i = 0; i < self.fade_channels.length; i++) {
        fade_string += `${self.fade_channels[i]},${self.data[self.fade_channels[i]]};`
    }
    values['artnet_fade'] = fade_string
    // let's output the bitmask again, so the user can see what it is and use it without creating a custom variable
    values['bitmask'] = self.bitmask
    console.log(values)
    self.setVariableValues(values)
}

module.exports = {
    init_variables,
    update_variables,
}
