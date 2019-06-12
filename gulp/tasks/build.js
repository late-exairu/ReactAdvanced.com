var gulp        = require('gulp');
var runSequence = require('run-sequence');
var hash        = require('gulp-hash');
var references  = require('gulp-hash-references');
var config      = require('../config');

gulp.task('hash:css', function(cb) {
  return gulp.src(config.dest.css + '/*.css')
    .pipe(hash({
      hashLength: 6,
      template: '<%= name %><%= hash %><%= ext %>'
    }))
    .pipe(gulp.dest(config.dest.css))
    .pipe(hash.manifest('minifestcss.json', {
      deleteOld: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('update-references:css', function() {
  return gulp.src('./build/*.html')
    .pipe(references('minifestcss.json')) // Replace file paths in index.html according to the manifest
    .pipe(gulp.dest(config.dest.root));
});

gulp.task('hash:js', function(cb) {
  return gulp.src(config.dest.js + '/*.js')
    .pipe(hash({
      hashLength: 6,
      template: '<%= name %><%= hash %><%= ext %>'
    }))
    .pipe(gulp.dest(config.dest.js))
    .pipe(hash.manifest('minifestjs.json', {
      deleteOld: true
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('update-references:js', function() {
  return gulp.src('./build/*.html')
    .pipe(references('minifestjs.json')) // Replace file paths in index.html according to the manifest
    .pipe(gulp.dest(config.dest.root));
});

gulp.task('hash', ['hash:css', 'hash:js']);

function build(cb) {
  if(config.env === 'production') {
    runSequence(
      'clean',
      'sprite:svg',
      'svgo',
      'sass',
      'nunjucks',
      'webpack',
      'copy',
      'list-pages',
      'hash',
      'update-references:css',
      'update-references:js',
      cb
    );
  } else {
    runSequence(
      'clean',
      'sprite:svg',
      'svgo',
      'sass',
      'nunjucks',
      'webpack',
      'copy',
      'list-pages',
      cb
    );
  }

}

gulp.task('build', function(cb) {
    config.setEnv('production');
    config.logEnv();
    build(cb);
});

gulp.task('build:dev', function(cb) {
    config.setEnv('development');
    config.logEnv();
    build(cb);
});
