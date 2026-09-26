import {TRANSLATE_SETTINGS, TRANSLATOR} from '../js/TranslateHelper.js'
import {Alert} from '../js/AlertHelper.js'
import {
    VARIABLE_VALUE_TYPES,
    convertVariableValue,
    formatVariableValue,
    getVariableValueType,
    parseVariableValue
} from '../js/VariableValue.js'

export default {
    name: 'VariableSettingPanel',

    template: `
<v-card flat class="ma-0 pa-0">
    <v-data-table
        v-if="tableHeaders"
        denses
        :headers="tableHeaders"
        :items="filteredTableItems"
        :search="search"
        :custom-filter="tableItemFilter"
        :items-per-page="5">
        <template v-slot:top>
            <v-text-field
                label="Search..."
                solo
                background-color="grey darken-3"
                v-model="search"
                dense
                hide-details
                @keydown.self.stop
                @focus="$event.target.select()">
            </v-text-field>
            <v-row
                class="ma-0 pa-0">
                <v-col
                    cols="12"
                    md="12">
                    <v-checkbox
                        v-model="excludeNameless"
                        dense
                        hide-details
                        label="Hide Nameless Items">
                    
                    </v-checkbox>
                </v-col>
            </v-row>
        </template>
        <template
            v-slot:item.valueType="{ item }">
            <v-select
                background-color="grey darken-3"
                class="d-inline-flex"
                style="width: 125px;"
                hide-details
                solo
                dense
                :items="valueTypes"
                v-model="item.valueType"
                @change="onTypeChange(item)">
            </v-select>
        </template>
        <template
            v-slot:item.value="{ item }">
            <v-text-field
                background-color="grey darken-3"
                class="d-inline-flex"
                height="10"
                style="min-width: 140px;"
                hide-details
                solo
                v-model="item.displayValue"
                label="Value"
                dense
                :disabled="item.valueType === 'null'"
                @keydown.self.stop
                @change="onItemChange(item)"
                @focus="$event.target.select()">
            </v-text-field>
        </template>
    </v-data-table>
    
    <v-tooltip
        bottom>
        <span>Reload from game data</span>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                style="top: 0px; right: 0px;"
                color="pink"
                dark
                small
                absolute
                top
                right
                fab
                v-bind="attrs"
                v-on="on"
                @click="initializeVariables">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </template>
    </v-tooltip>
</v-card>
    `,

    data () {
        return {
            search: '',
            excludeNameless: false,

            variableNames: [],
            valueTypes: VARIABLE_VALUE_TYPES,

            tableHeaders: [
                {
                    text: 'Name',
                    value: 'name'
                },
                {
                    text: 'Type',
                    value: 'valueType',
                    width: 140
                },
                {
                    text: 'Value',
                    value: 'value'
                }
            ],
            tableItems: []
        }
    },

    created () {
        this.initializeVariables()
    },

    computed: {
        filteredTableItems () {
            return this.tableItems.filter(item => {
                if (item.id === 0 || (this.excludeNameless && !item.name)) {
                    return false
                }

                return true
            })
        }
    },

    methods: {
        async initializeVariables () {
            this.variableNames = await this.getVariableNames()

            this.tableItems = this.variableNames.map((varName, idx) => {
                const value = $gameVariables.value(idx)
                return {
                    id: idx,
                    name: varName,
                    value: value,
                    valueType: getVariableValueType(value),
                    displayValue: formatVariableValue(value)
                }
            })
        },

        async getVariableNames () {
            const rawVariableNames = $dataSystem.variables.slice()

            if (TRANSLATE_SETTINGS.isVariableTranslateEnabled()) {
                return await TRANSLATOR.translateBulk(rawVariableNames)
            }

            return rawVariableNames
        },

        onItemChange (item) {
            try {
                const value = parseVariableValue(item.displayValue, item.valueType)
                $gameVariables.setValue(item.id, value)
            } catch (err) {
                Alert.error(`Could not update variable ${item.id}: ${err.message}`)
            }

            this.refreshItem(item)
        },

        onTypeChange (item) {
            try {
                $gameVariables.setValue(item.id, convertVariableValue(item.value, item.valueType))
            } catch (err) {
                Alert.error(`Could not change variable ${item.id} type: ${err.message}`)
            }
            this.refreshItem(item)
        },

        refreshItem (item) {
            const value = $gameVariables.value(item.id)
            item.value = value
            item.valueType = getVariableValueType(value)
            item.displayValue = formatVariableValue(value)
        },

        tableItemFilter (value, search, item) {
            if (search === null || search.trim() === '') {
                return true
            }

            search = search.toLowerCase()

            return String(item.name || '').toLowerCase().includes(search) || String(item.displayValue).toLowerCase().includes(search)
        }
    }
}
