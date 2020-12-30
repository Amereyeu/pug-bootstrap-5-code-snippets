const gulp = require("gulp"),
  autoprefixer = require("gulp-autoprefixer"),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  sass = require("gulp-sass"),
  concat = require("gulp-concat"),
  pug = require("gulp-pug"),
  uglify = require("gulp-uglify"),
  imagemin = require("gulp-imagemin"),
  cache = require("gulp-cache"),
  replace = require("gulp-replace");

const root = "src/",
  scss = root + "scss/",
  js = root + "js/",
  jsDist = "dist/" + "js/";

const htmlWatchFiles = root + "html/**/*.html",
  styleWatchFiles = scss + "**/*.scss",
  pugWatchFiles = root + "pug/**/*.pug";

const jsSrc = [js + "test.js"];

function buildHTML() {
  return gulp
    .src([root + "pug/*.pug"])
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(root + "html"))
    .pipe(gulp.dest("dist/"));
}

function css() {
  return gulp
    .src(scss + "styles.scss", { sourcemaps: true })
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer("last 2 versions"))
    .pipe(gulp.dest("dist/css/", { sourcemaps: "." }));
}

function editorCSS() {
  return gulp
    .src(scss + "styles.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest("dist/css/"));
}

function javascript() {
  return gulp
    .src(jsSrc)
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(gulp.dest(jsDist));
}

function cacheBustTask() {
  var cbString = new Date().getTime();
  return gulp
    .src([root + "html/*.html"])
    .pipe(replace(/acab=\d+/g, "acab=" + cbString))
    .pipe(gulp.dest("dist/"));
}

function images() {
  return gulp
    .src(root + "img/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img/'));
}

function watch() {
  browserSync.init({
    notify: false,
    files: ["**/*.html"],
    server: {
      baseDir: "dist/",
    },
  });
  gulp.watch(styleWatchFiles, css);
  //gulp.watch(styleWatchFiles, editorCSS);
  gulp.watch(pugWatchFiles, buildHTML);
  gulp.watch(jsSrc, javascript);
  gulp
    .watch(
      [htmlWatchFiles, jsDist + "all.js", "dist/css/styles.css"],
      gulp.series(cacheBustTask)
    )
    .on("change", reload);
}

exports.css = css;
exports.editorCSS = editorCSS;
exports.javascript = javascript;
exports.watch = watch;
exports.buildHTML = buildHTML;
exports.images = images;

const build = gulp.series(cacheBustTask, watch);
gulp.task("default", build);
