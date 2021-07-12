const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
//before build delete all content in the dist folder
const del = require("del");

//localhost
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
}
//clean dist folder
function cleanDist() {
  return del("dist");
}
//imagemin
function images() {
  return src("app/images/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

//js uglify
function scripts() {
  return (
    src([
      // connect jquery
      "node_modules/jquery/dist/jquery.js",
      //connect main.js
      "app/js/main.js",
    ])
      //concat main.js in main.min.js
      .pipe(concat("main.min.js"))
      //minification main.js
      .pipe(uglify())
      .pipe(dest("app/js"))
      //reload localhost
      .pipe(browserSync.stream())
  );
}

function styles() {
  return (
    src("app/scss/style.scss")
      //create compressed css
      .pipe(scss({ outputStyle: "expanded" }))
      //commit down line and push in style.css
      .pipe(concat("style.min.css"))
      //autoprefixer for old browsers
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 10 version"],
          grid: true,
        })
      )
      .pipe(dest("app/css"))
      .pipe(browserSync.stream())
  );
}

//buld
function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/main.min.js",
      "app/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

//watching and changing
function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, browsersync, watching);
