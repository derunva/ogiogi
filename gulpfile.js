const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const debug = require('gulp-debug');
var cleancss = require('gulp-cleancss');
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const webpack = require('webpack-stream');
const clean = require('gulp-clean');
const { series } = require('gulp');
const paths = {
  "root": './dist',
  "html": {
    "watch": [
      "./source/views/**/*.pug"
    ],
    "source": "./source/views/pages/*.pug",
    "dest": "./dist"
  },
  "css": {
    "watch": ["./source/assets/sass/*.sass", "./source/assets/sass/*.scss"],
    "source": ["./source/assets/sass/*.sass", "./source/assets/sass/*.scss"],
    "dest": "./dist/css"
  },
  "js": {
    "watch": "./source/assets/js/main.js",
    "source": "./source/assets/js/main.js",
    "dest": "./dist/js"
  }
}
let isDev = true
let isProd = !isDev
var webpackConfig = {
  "output": {
    "filename": "main.js"
  },
  "module": {
    "rules": [
      {
        "test": /\.js$/,
        "loader": "babel-loader",
        "exclude": "/node_modules/"
      }
    ]
  },
  mode: isDev ? 'development' : 'production'
}
async function buildCss (cb) {
  gulp.src(paths.css.source)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleancss({keepBreaks: true}))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.stream())
    cb()
}
async function buildHTML (cb) {
  gulp.src(paths.html.source)
    .pipe(pug({ "pretty" : true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
    cb()
}
async function buildJs(cb) {
  gulp.src(paths.js.source)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream())
    cb()
}
function imagesCopy(cb) {
  gulp.src('./source/assets/img/*')
    .pipe(gulp.dest('./dist/img/'))
    .pipe(browserSync.stream())
    cb()
}
async function cleanDist(cb) {
  gulp.src('./dist/', {read: false, allowEmpty: true})
    .pipe(clean());
  cb()
}
async function watch (cb) {
  browserSync.init({
    server: {
      baseDir: paths.root
    }
  })
  gulp.watch(paths.html.watch, buildHTML)
  gulp.watch(paths.css.watch, buildCss)
  gulp.watch(paths.js.watch, buildJs)
  cb()
}


exports.clean = cleanDist;
exports.images = imagesCopy;
exports.js = buildJs;
exports.css = buildCss;
exports.templates = buildHTML;
exports.watch = watch;
exports.build = series(cleanDist, imagesCopy, buildCss, buildHTML, buildJs);
