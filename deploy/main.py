import argparse
import json
import shutil
from enum import Enum
from pathlib import Path


class GameTypes(Enum):
    MV = 'mv'
    MZ = 'mz'


class Paths:
    def __init__(self):
        self.deploy_dir = Path(__file__).resolve().parent
        self.repository_dir = self.deploy_dir.parent
        self.source_root = self.repository_dir / 'cheat-engine' / 'www'
        self.temp_root = self.deploy_dir / 'tmp' / 'www'
        self.output_dir = self.deploy_dir / 'output'

    def initializer_dir(self, game_type):
        return self.source_root / '_cheat_initialize' / game_type.value

    def output_base(self, game_type, version):
        return self.output_dir / f'rpg-{game_type.value}-cheat-{version}-core'


def copy_source(paths):
    if paths.temp_root.parent.exists():
        shutil.rmtree(paths.temp_root.parent)

    shutil.copytree(
        paths.source_root,
        paths.temp_root,
        ignore=shutil.ignore_patterns('.idea', '__pycache__', '*.pyc'),
    )


def prepare_archive(game_type, version, paths):
    copy_source(paths)

    if game_type is GameTypes.MV:
        shutil.copytree(
            paths.initializer_dir(game_type) / 'js',
            paths.temp_root / 'js',
        )

    # MZ intentionally does not ship a replacement js/main.js. Replacing the
    # engine bootstrap breaks games made with newer MZ releases. Users add the
    # bundled cheat entry to their existing scriptUrls list instead.
    shutil.rmtree(paths.temp_root / '_cheat_initialize')

    with (paths.temp_root / 'cheat-version-description.json').open('w', encoding='utf-8') as version_file:
        json.dump({'version': f'v{version}'}, version_file, indent=2)


def build_release(game_type, version, paths):
    prepare_archive(game_type, version, paths)
    paths.output_dir.mkdir(parents=True, exist_ok=True)
    output_path = shutil.make_archive(
        str(paths.output_base(game_type, version)),
        'zip',
        root_dir=paths.temp_root,
    )
    shutil.rmtree(paths.temp_root.parent)
    return Path(output_path)


def main():
    parser = argparse.ArgumentParser(description='RPG Maker MV/MZ cheat deploy maker')
    parser.add_argument('--version', required=True, help='version of deployment, for example 1.0.4')
    args = parser.parse_args()

    paths = Paths()
    for game_type in GameTypes:
        output_path = build_release(game_type, args.version, paths)
        print(output_path)


if __name__ == '__main__':
    main()
