from setuptools import setup
from setuptools import find_packages

version = '0.0.1'

classifiers = """
Development Status :: 3 - Alpha
Intended Audience :: Developers
Operating System :: OS Independent
Programming Language :: JavaScript
Programming Language :: Python :: 3
Programming Language :: Python :: 3.6
""".strip().splitlines()

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
        'zinc',  # 'opencmiss.zinc',
        'sanic',
    ],
    include_package_data=True,
    python_requires='>=3.5',
    entry_points={
    },
    # test_suite="",
)
