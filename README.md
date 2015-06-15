# baufivergleich

First do
  npm install

Then run
  gulp
to run the development server, or
  ./run_tests.sh
to run the tests.

(The shell script is necessary because jest needs node --harmony, at
least in older node.js versions, so if we want to run the tests with
gulp we need to run it with node --harmony as well.)
~                                                          
