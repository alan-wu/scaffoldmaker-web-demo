from setuptools import setup
from setuptools import find_packages

version = '0.0.1'

classifiers = """
Development Status :: 3 - Alpha
Intended Audience :: Developers
Operating System :: OS Independent
Programming Language :: JavaScript
Programming Language :: Python :: 3
Programming Language :: Python :: 3.5
Programming Language :: Python :: 3.6
""".strip().splitlines()

package_json = {
    "dependencies": {
        "dat.gui": "~0.7.1",
        "zincjs": "~0.28.4",
    },
    "devDependencies": {
        "eslint": "~3.15.0",
    }
}

setup(
    name='scaffoldmaker_webdemo',
    version=version,
    description='Web demo of the scaffoldmaker',
    long_description=open('README.md').read(),
    classifiers=classifiers,
    keywords='',
    author='Auckland Bioengineering Institute',
    url='https://github.com/alan-wu/scaffoldmaker-web-demo',
    packages=find_packages('src', exclude=['ez_setup']),
    package_dir={'': 'src'},
    namespace_packages=[],
    zip_safe=False,
    install_requires=[
        'setuptools>=12',
        'sqlalchemy>=0.9',
        # 'opencmiss.zinc',
        'scaffoldmaker',
        'sanic',
    ],
    extras_require={
        'webpack': [
            'calmjs.webpack',
        ],
    },
    extras_calmjs={
        'node_modules': {
            'three': 'three/build/three.js',
            'dat.gui': 'dat.gui/build/dat.gui.js',
            'Zinc': 'zincjs/build/zinc.js',
        },
    },
    package_json=package_json,
    calmjs_module_registry=['calmjs.module'],
    include_package_data=True,
    python_requires='>=3.5',
    build_calmjs_artifacts=True,
    entry_points={
        'console_scripts': [
            'scaffoldmaker_web = scaffoldmaker_webdemo.app:main',
        ],
        'calmjs.module': [
            'scaffoldmaker_webdemo = scaffoldmaker_webdemo',
        ],
        'calmjs.artifacts': [
            'bundle.js = calmjs.webpack.artifact:complete_webpack',
        ],
    },
    # test_suite="",
)
