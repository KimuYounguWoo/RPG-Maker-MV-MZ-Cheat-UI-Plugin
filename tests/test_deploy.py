import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path


REPOSITORY_DIR = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location('cheat_deploy', REPOSITORY_DIR / 'deploy' / 'main.py')
DEPLOY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DEPLOY)


class DeployTest(unittest.TestCase):
    def build(self, game_type, temp_directory):
        paths = DEPLOY.Paths()
        paths.temp_root = Path(temp_directory) / 'work' / 'www'
        paths.output_dir = Path(temp_directory) / 'output'
        return DEPLOY.build_release(game_type, '1.0.4', paths)

    def test_mv_archive_contains_bootstrap_and_offline_assets(self):
        with tempfile.TemporaryDirectory() as temp_directory:
            output_path = self.build(DEPLOY.GameTypes.MV, temp_directory)
            with zipfile.ZipFile(output_path) as archive:
                names = set(archive.namelist())
                self.assertIn('js/main.js', names)
                self.assertIn('cheat/libs/vuetify.min.css', names)
                self.assertIn('cheat/fonts/materialdesignicons-webfont.woff2', names)
                self.assertEqual(archive.read('cheat-version-description.json'), b'{\n  "version": "v1.0.4"\n}')

    def test_mz_archive_preserves_the_games_main_file(self):
        with tempfile.TemporaryDirectory() as temp_directory:
            output_path = self.build(DEPLOY.GameTypes.MZ, temp_directory)
            with zipfile.ZipFile(output_path) as archive:
                names = set(archive.namelist())
                self.assertNotIn('js/main.js', names)
                self.assertIn('cheat/init/import.js', names)


if __name__ == '__main__':
    unittest.main()
