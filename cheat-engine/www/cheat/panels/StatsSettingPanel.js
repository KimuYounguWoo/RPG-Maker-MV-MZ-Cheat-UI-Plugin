import {GeneralCheat} from '../js/CheatHelper.js'
import {Alert} from '../js/AlertHelper.js'
import {parseFiniteNumber} from '../js/Validation.js'

export default {
    name: 'StatsSettingPanel',

    template: `
<v-card flat class="ma-0 pa-0">
    <v-tabs
        v-model="selectedTab"
        dark
        background-color="grey darken-3"
        show-arrows>
        <v-tab
            v-for="actor in actors"
            :key="actor.id">
            {{actor.name}}
        </v-tab>
    </v-tabs>
    <v-tabs-items
        dark
        v-model="selectedTab">
        <v-tab-item
            v-for="actor in actors"
            :key="actor.id">
            <v-card
                flat
                class="ma-0">
                <v-card-actions
                    class="pa-0">
                    <v-checkbox
                        v-model="actor.godMode"
                        label="God Mode"
                        @change="onGodModeChange(actor)">
                    </v-checkbox>
                    <v-spacer></v-spacer>
                    <v-tooltip
                        bottom>
                        <span>Reload from game data</span>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="pink"
                                dark
                                small
                                fab
                                v-bind="attrs"
                                v-on="on"
                                @click="initializeVariables">
                                <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-card-actions>
                <v-card-subtitle class="pa-0">Level / EXP</v-card-subtitle>
                <v-row class="mt-0">
                    <v-col>
                        <v-text-field
                            label="Lv"
                            v-model="actor.level"
                            outlined
                            dense
                            hide-details
                            @keydown.self.stop
                            @change="onLevelChange(actor)"
                            @focus="$event.target.select()"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field
                            label="EXP"
                            v-model="actor.exp"
                            outlined
                            dense
                            hide-details
                            @keydown.self.stop
                            @change="onExpChange(actor)"
                            @focus="$event.target.select()"></v-text-field>
                    </v-col>
                </v-row>
                
                <v-card-subtitle class="pa-0 mt-4">Stats</v-card-subtitle>
                <v-row class="mt-0">
                    <v-col
                        v-for="(_, paramIdx) in actor.param.length"
                        :key="paramIdx"
                        cols="12"
                        md="6">
                        <v-text-field
                            :label="paramNames[paramIdx]"
                            v-model="actor.param[paramIdx]"
                            outlined
                            dense
                            hide-details
                            @keydown.self.stop
                            @change="onParamChange(actor, paramIdx)"
                            @focus="$event.target.select()"></v-text-field>
                    </v-col>
                </v-row>
            </v-card>
        </v-tab-item>
    </v-tabs-items>
</v-card>
    `,

    data () {
        return {
            selectedTab: null,
            paramNames: [], // name of stats (Max HP, ATK, ...)
            actors: []
        }
    },

    created () {
        this.initializeVariables()
    },

    methods: {
        extractActorData (actor) {
            // get actor param
            const paramSize = actor._paramPlus.length
            const param = new Array(paramSize)

            for (let paramId = 0; paramId < paramSize; ++paramId) {
                param[paramId] = actor.param(paramId)
            }

            return {
                _actor: actor,
                id: actor._actorId,
                name: actor._name,
                godMode: GeneralCheat.isGodMode(actor),
                level: actor.level,
                exp: actor.currentExp(), // actor._exp contains exp data for each class (_exp[classId] = exp)
                param: param
            }
        },

        initializeVariables () {
            this.paramNames = $dataSystem.terms.params
            this.actors = $gameParty.members().map(actor => this.extractActorData(actor))
        },

        onLevelChange (item) {
            try {
                const level = parseFiniteNumber(item.level, {
                    label: 'Level', integer: true, min: 1, max: item._actor.maxLevel()
                })
                item._actor.changeLevel(level, false)
            } catch (err) {
                Alert.error(err.message)
            }
            this.initializeVariables()
        },

        onExpChange (item) {
            try {
                const exp = parseFiniteNumber(item.exp, { label: 'EXP', integer: true, min: 0 })
                item._actor.changeExp(exp, false)
            } catch (err) {
                Alert.error(err.message)
            }
            this.initializeVariables()
        },

        onParamChange (item, paramIndex) {
            try {
                const param = parseFiniteNumber(item.param[paramIndex], {
                    label: this.paramNames[paramIndex], integer: true, min: 0
                })
                item._actor.addParam(paramIndex, param - item._actor.param(paramIndex))
            } catch (err) {
                Alert.error(err.message)
            }
            this.initializeVariables()
        },

        onGodModeChange (item) {
            GeneralCheat.toggleGodMode(item._actor)
            this.initializeVariables()
        }
    }
}
