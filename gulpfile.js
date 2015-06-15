var gulp = require("gulp"),
    browserify = require("browserify"),
    reactify = require("reactify"),
    source = require("vinyl-source-stream"),
    browserSync = require("browser-sync"),
    proxy = require("proxy-middleware"),
    url = require("url"),
    jest = require("gulp-jest"),
    merge = require("merge-stream"),
    glob = require("glob"),
    path = require("path"),
    del = require("del"),
    flow = require("gulp-flowtype"),
    jshint = require("gulp-jshint"),
    react = require("gulp-react"),
    package = require("./package.json");

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task("js", function () {
    // build separate bundles for each i18n file

    var i18n_files = glob.sync(package.paths.i18n);
    var tasks = i18n_files.map(function (filename) {
        var dirname = "./" + path.relative(package.paths.basedir,
                                           path.dirname(filename));
        var module_name = path.basename(filename, ".js");
        // to get something like ./i18n/module from app/i18n/module.js
        return browserify([], {basedir: package.paths.basedir})
            .require(dirname + "/" + module_name)
            .bundle()
            .on("error", handleError)
            .pipe(source(path.basename(filename)))
            .pipe(gulp.dest(package.dest.dist));
    });

    var merged = merge(tasks);

    // note that we don't need to exclude the i18n modules from the main build
    // because they're not directly require'd

    var reactifyOpts = {
        "stripTypes": true,
        "es6": false
    };

    merged.add(browserify(package.paths.main)
	       .transform(reactify, reactifyOpts)
	       .bundle()
               .on("error", handleError)
	       .pipe(source(package.dest.app))
	       .pipe(gulp.dest(package.dest.dist)));

    return merged;
});

gulp.task("lint", function () {
    var jshintOpts = {
        "browserify": true,
        "newcap": false
    };

    return gulp.src([package.paths.js, package.paths.jsx])
        .pipe(react())
        .pipe(jshint(jshintOpts))
        .pipe(jshint.reporter("default"));
});

gulp.task("copy", function () {
    return merge(gulp.src(package.paths.html)
                 .pipe(gulp.dest(package.dest.dist)),
                 gulp.src(package.paths.assets)
                 .pipe(gulp.dest(path.join(package.dest.dist, "assets"))));
});

gulp.task("flow", function () {
    var flowOpts = {
        all: false,
        weak: false,
        killFlow: false,
        beep: true,
        abort: false
    };
    
    return gulp.src([package.paths.js, package.paths.jsx])
        .pipe(flow(flowOpts));
});

gulp.task('clean', function(cb) {
    return del(['dist/**'], cb);
});

gulp.task("server", ["copy", "js"], function () {
    // Forward requests to /api to the API server
    var proxyOptions = url.parse("http://10.21.67.21:8080");
    proxyOptions.route = "/api";

    browserSync({
	server: {
	    baseDir: package.dest.dist,
            middleware: [proxy(proxyOptions)]
	}
    });
});

gulp.task("watch", ["copy", "js", "server"], function () {
    return gulp.watch([package.paths.js, package.paths.jsx,
		       package.paths.html, package.paths.assets],
		      ["copy", "js", browserSync.reload]);
});

gulp.task("jest", function () {
    return gulp.src("./").pipe(jest({
        scriptPreprocessor: "./util/testPreprocessor.js",
        unmockedModulePathPatterns: [
            "node_modules/react",
            "node_modules/reflux",
            "node_modules/immutable",
            "node_modules/intl",
            "node_modules/react-intl",
            "node_modules/react-bootstrap",
            "util/renderWithIntlContext"
        ],
        testPathIgnorePatterns: [
            "node_modules"
        ],
        moduleFileExtensions: [
            "js",
            "jsx"
        ],
        setupEnvScriptFile: "./util/setupIntlPolyfill.js"
    }));
});

gulp.task("default", ["watch"]);
