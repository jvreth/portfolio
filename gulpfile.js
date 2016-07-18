var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var uglify      = require('gulp-uglify');

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Build the Jekyll Site

gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

// Rebuild Jekyll & do page reload

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

// Wait for jekyll-build, then launch the Server

gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
  browserSync({
    server: {
      baseDir: '_site'
    },
    browser: "google chrome"
  });
});

// Compile files from _assets/sass into both _site/assets/css (for live injecting) and assets/css (for future jekyll builds)

gulp.task('sass', function () {
  return gulp.src('_assets/scss/main.scss')
    .pipe(sass({
      includePaths: ['scss'],
      onError: browserSync.notify
    }))
    .pipe(prefix(['last 2 versions'], { cascade: true }))
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css'));
});

// Compile files from _assets/js into both _site/assets/js (for live injecting) and assets/js (for future jekyll builds)

gulp.task('uglify', function () {
  // return gulp.src('_assets/js/smooth-scroll.js')
  return gulp.src('_assets/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('_site/assets/js'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/js'));
});

// Minify Images from _assets/images into both _site/assets/images (for live injecting) and assets/images (for future jekyll builds)

gulp.task('imagemin', function () {
  return gulp.src('_assets/images/**/*')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      interlaced: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('_site/assets/images'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/images'))
});

// Copy Font Files from _assets/fonts into both _wite/assets/fonts (for live injecting) and assets/fonts (for future jekyll builds)

gulp.task('copyfonts', function() {
  gulp.src('_assets/fonts/**/*.{eof,otf,ttf,woff,woff2}')
  .pipe(gulp.dest('_site/assets/fonts'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('assets/fonts'));
});

// Watch _assets/**/* files for changes & recompile
// Watch html files, run jekyll & reload BrowserSync

gulp.task('watch', function () {
  gulp.watch('_assets/scss/**/*', ['sass']);
  gulp.watch('_assets/images/**/*', ['imagemin']);
  gulp.watch('_assets/js/**/*', ['uglify']);
  gulp.watch('_assets/fonts/**/*', ['copyfonts']);
  // gulp.watch(['**/*.md', '**/*.html', '!./_site/**/*', '!./node_modules/**/*', '!./_site/**/*', '_data/**/*', '_layouts/**/*', '_includes/**/*'], ['jekyll-rebuild']);
  gulp.watch(['./index.html', './_posts/**/*', './_data/**/*', './_layouts/**/*', './_includes/**/*', './jobs/**/*', './dev/index.html'], ['jekyll-rebuild']);
});

// Default task, running just `gulp` will compile the sass,compile the jekyll site, launch BrowserSync & watch files

gulp.task('default', ['browser-sync', 'watch']);
