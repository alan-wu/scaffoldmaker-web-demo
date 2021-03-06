# scaffoldmaker-web-demo
This demo demonstrates the use of [scaffoldmaker](https://github.com/ABI-Software/scaffoldmaker) on the backend and [ZincJS](https://github.com/alan-wu/Web-based-Zinc-Visualisation) on the front end to display the result of dynamic scaffold generations.

## Installation

This demo now runs with calmjs, to learn more about calmjs please take a look here https://github.com/calmjs/calmjs .

In a virtual environment that has opencmiss.zinc available, clone this
repository, change to that directory and run

```
pip install -r requirements.txt
calmjs npm --install scaffoldmaker_webdemo[webpack] -D
python setup.py build
```

Currently, the quickest way to construct this virtual environment is to
ensure that the default system Python is 3.5+, then run the following
commands (adapted from [instructions on OpenCMISS website](
http://opencmiss.org/documentation/building/cmake/setup/docs/cli/gnulinux.html)):

```
mkdir opencmiss
mkdir setup-build
git clone https://github.com/OpenCMISS/setup.git
cd setup-build
cmake -DOPENCMISS_ROOT=../opencmiss ../setup -DOPENCMISS_LIBRARIES=zinc
cmake --build .
```

The build will take some time.  Once that is done, run the following
(this assumes Python 3.5 is the version available/activated at the
system level):

```
source ../opencmiss/install/virtual_environments/oclibs_venv_py35_release/bin/activate
cd ../scaffoldmaker-web-demo
pip install -r requirements.txt
calmjs npm --install scaffoldmaker_webdemo[webpack] -D
python setup.py build
```

Then run `scaffoldmaker_web`, which will start the webserver on port
8000 by default.  Open a webbrowser to http://localhost:8000 to use the
application.
