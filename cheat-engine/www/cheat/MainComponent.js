import CheatModal from './CheatModal.js'
import { GLOBAL_SHORTCUT } from "./js/GlobalShortcut.js"
import { GeneralCheat } from './js/CheatHelper.js'
import AlertSnackbar from './components/AlertSnackbar.js'
import ConfirmDialog from './components/ConfirmDialog.js'
import { customizeRPGMakerFunctions } from './init/customize_functions.js'
import {Key} from './js/KeyCodes.js'
import {Alert} from'./js/AlertHelper.js'
import {compareVersions} from './js/Version.js'
import {getGameContentPath} from './js/PathHelper.js'

export default {
    name: 'MainComponent',
    components: { CheatModal, AlertSnackbar, ConfirmDialog },
    template: `
<div 
    class="pa-2"
    ref="rootDiv">
    <v-fade-transition leave-absolute>
        <cheat-modal
            id="cheat-modal"
            class="opaque-on-mouseover"
            v-model="currentComponentName"
            v-if="show"
            >
        </cheat-modal>
    </v-fade-transition>
    <alert-snackbar></alert-snackbar>
    <confirm-dialog></confirm-dialog>
</div>`,

    data () {
        return {
            currentKey: Key.createEmpty(),
            show: false,
            currentComponentName: null
        }
    },

    created () {
        const self = this

        customizeRPGMakerFunctions(self)

        GeneralCheat.toggleCheatModal = (componentName = null) => {
            this.toggleCheatModal(componentName)
        }

        GeneralCheat.openCheatModal = (componentName = null) => {
            this.openCheatModal(componentName)
        }

        GeneralCheat.checkForUpdates = () => {
            this.checkVersion(true)
        }

        window.addEventListener('keydown', this.onGlobalKeyDown)
        window.addEventListener('keyup', this.onGlobalKeyUp)

    },

    beforeDestroy () {
        window.removeEventListener('keydown', this.onGlobalKeyDown)
        window.removeEventListener('keyup', this.onGlobalKeyUp)
    },

    methods: {
        onGlobalKeyDown (e) {
            if (e.repeat) {
                GLOBAL_SHORTCUT.runKeyRepeatEvent(e, Key.fromKey(this.currentKey))
            } else {
                GLOBAL_SHORTCUT.runKeyLeaveEvent(e, Key.fromKey(this.currentKey))
                this.currentKey.add(e.keyCode)
                this.currentKey.adjustCombiningKey(e)
                GLOBAL_SHORTCUT.runKeyEnterEvent(e, Key.fromKey(this.currentKey))
            }
        },

        onGlobalKeyUp (e) {
            GLOBAL_SHORTCUT.runKeyLeaveEvent(e, Key.fromKey(this.currentKey))
            this.currentKey.remove(e.keyCode)
            GLOBAL_SHORTCUT.runKeyEnterEvent(e, Key.fromKey(this.currentKey))
        },

        openCheatModal (componentName) {
            if (componentName) {
                this.currentComponentName = componentName
            }

            this.show = true
        },

        toggleCheatModal (componentName) {
            const prevComponentName = this.currentComponentName

            if (componentName) {
                this.currentComponentName = componentName
            }

            // close
            if (this.show) {
                // hide modal if only componentName unchanged
                if (!componentName || componentName === prevComponentName) {
                    this.show = false
                }
                return
            }

            // open
            this.show = true
        },

        async checkVersion (showUpToDate = false) {
            if (!Utils.isNwjs()) {
                return
            }

            try {
                const releaseInfo = (await axios.get(
                    'https://api.github.com/repos/paramonos/RPG-Maker-MV-MZ-Cheat-UI-Plugin/releases/latest',
                    { timeout: 5000 }
                )).data

                const currentCheatVersion = this.getCurrentCheatVersion()

                if (!currentCheatVersion) {
                    return
                }

                if (compareVersions(currentCheatVersion, releaseInfo.tag_name) < 0) {
                    Alert.warn(`New cheat version has been released : ${currentCheatVersion} → ${releaseInfo.tag_name}`, null, 3000)
                } else if (showUpToDate) {
                    Alert.success(`Cheat is up to date: ${currentCheatVersion}`)
                }
            } catch (err) {
                if (showUpToDate) {
                    Alert.warn('Could not check for updates. Check your network connection.', err)
                }
            }
        },

        getCurrentCheatVersion () {
            try {
                const versionFile = getGameContentPath('cheat-version-description.json')
                const description = JSON.parse(require('fs').readFileSync(versionFile, 'utf-8'))

                return description.version
            } catch (err) {
                return null
            }
        }
    }
}
