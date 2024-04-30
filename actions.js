function getActionDefinitions(self) {
    return {
        setBitMask: {
            name: 'Set Bitmask',
            options: [
                {
                    type: 'textinput',
                    label: 'Bitmask',
                    id: 'values',
                    default: '0',
                    useVariables: true,
                },
            ],
            callback: async (action) => {
                self.bitmask = await self.parseVariablesInString(action.options.values)
                self.updateVariables()
            },
        },
        setPrimaryDimmer: {
            name: 'Set Primary Dimmer',
            options: [
                {
                    type: 'textinput',
                    label: 'Primary Dimmer',
                    id: 'values',
                    default: '0',
                    useVariables: true,
                },
            ],
            callback: async (action) => {
                self.primary_dimmer = await self.parseVariablesInString(action.options.values)
                self.updateVariables()
            },
        },
        setSecondaryDimmer: {
            name: 'Set Secondary Dimmer',
            options: [
                {
                    type: 'textinput',
                    label: 'Secondary Dimmer',
                    id: 'values',
                    default: '0',
                    useVariables: true,
                },
            ],
            callback: async (action) => {
                self.secondary_dimmer = await self.parseVariablesInString(action.options.values)
                self.updateVariables()
            },
        },
        update: {
            name: 'Update',

            options: [
                // update all fields at once, primary dimmer, secondary dimmer and bitmask
                {
                    type: 'textinput',
                    label: 'Bitmask',
                    id: 'bitmask',
                    default: '0',
                    useVariables: true,
                },
                {
                    type: 'textinput',
                    label: 'Primary Dimmer',
                    id: 'primary_dimmer',
                    default: '0',
                    useVariables: true,
                },
                {
                    type: 'textinput',
                    label: 'Secondary Dimmer',
                    id: 'secondary_dimmer',
                    default: '0',
                    useVariables: true,
                },
            ],
            callback: async (action) => {
                self.bitmask = await self.parseVariablesInString(action.options.bitmask)
                self.primary_dimmer = await self.parseVariablesInString(action.options.primary_dimmer)
                self.secondary_dimmer = await self.parseVariablesInString(action.options.secondary_dimmer)
                self.updateVariables()
            }
        }
    }
}

module.exports = {
    getActionDefinitions,
}