// VAR
var 	autoprefixer	= require('autoprefixer'),
		browserSync		= require('browser-sync'),
		cssnano			= require('cssnano'),
		gulp			= require('gulp'),
		gulpCached		= require('gulp-cached'),
		gutil			= require('gulp-util'),
		sass			= require('gulp-sass'),
		sourcemaps		= require('gulp-sourcemaps'),
		size			= require('gulp-size'),
		postcss			= require('gulp-postcss'),
		wait			= require('gulp-wait'),
		rename			= require('gulp-rename'),
		svgSprite		= require('gulp-svg-sprite'),
		nunjucksRender 	= require('gulp-nunjucks-render'),
		prettify 		= require('gulp-prettify'),
		uglify 			= require('gulp-uglify'),
		cssnext			= require('postcss-cssnext'),
		precss			= require('precss'),
		ftp 			= require('vinyl-ftp'),
		minimist		= require('minimist');

var args = minimist(process.argv.slice(2));


// ==================================================
// Errors Handler
// ==================================================

var err = {
	errorHandler: function (error) {
		gutil.log('Error: ' + error.message);
		gutil.beep();
		this.emit('end');
	}
}

// ==================================================
// Nunjucks
// ==================================================


gulp.task('nunjucks', function () {
	return gulp.src('src/templates/*.html')
		.pipe(nunjucksRender({
			path: ['src/templates/']
		}))
		.pipe(gulp.dest('build'));
});

// ==================================================
// SASS to CSS
// ==================================================

gulp.task('sass', function() {
	gulp.src('src/sass/**/*.scss')
		.pipe( wait(100) )
		.pipe( sass() )
		.pipe( gulp.dest('src/css/') );
});

// ==================================================
// CSS Enhancement
// ==================================================

gulp.task('css', function () {
	var plugins = [
		//precss(),
		autoprefixer({browsers: ['last 2 version']}),
		cssnano()
	];

	return gulp.src('src/css/style.css')
		.pipe( sourcemaps.init() )
		.pipe( postcss(plugins) )
		.pipe( rename({suffix: '.min', prefix : ''}) )
		.pipe( sourcemaps.write('.') )
		.pipe( gulp.dest('build/css') )
		.pipe( browserSync.reload({stream: true}) );
});

// ==================================================
// SVG Sprite
// ==================================================

gulp.task('sprite', function () {
	return gulp.src('src/img/svg/*.svg')
		.pipe( svgSprite({
			shape: {
				spacing: {
					padding: 0
				}
			},
			mode: {
				css: {
					dest: "img/",
					layout: "diagonal",
					sprite: '../sprite.svg',
					bust: false,
					render: {
						scss: {
							dest: "../../sass/helpers/_sprite-svg.scss",
							template: "sass/tpl/_sprite-tpl-css.scss"
						}
					}
				},

				symbol: {
					dest: "img/",
					layout: "diagonal",
					sprite: '../sprite-inline.svg',
					bust: false,
					render: {
						scss: {
							dest: "../../sass/helpers/_sprite-svg-inline.scss",
							template: "sass/tpl/_sprite-tpl-inline.scss"
						}
					}
				}
			},
			variables: {
				mapname: "icons"
			}
		}))
		.pipe(gulp.dest('build/img/'));
});

// ==================================================
// UglifyJS
// ==================================================

gulp.task('uglify', function () {
	gulp.src('src/js/*.js')
		.pipe( uglify() )
		.pipe( gulp.dest('build/js/') );
});

// ==================================================
// BrowserSync
// ==================================================

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: "build"
		},
		notify: false
	});
});


// ==================================================
// Copy
// ==================================================


gulp.task('copy:img', function () {
	return gulp
		.src('src/img/**/*.{jpg,png,jpeg,svg,gif,ico}')
		.pipe(gulpCached('images'))
		.pipe(gulp.dest('build/img/'));
});

gulp.task('copy:pic', function () {
	return gulp
		.src('src/pic/**/*.{jpg,png,jpeg,svg,gif,ico}')
		.pipe(gulpCached('pictures'))
		.pipe(gulp.dest('build/pic/'));
});

gulp.task('copy:video', function () {
	return gulp
		.src('src/video/*.{mp4,webm,mov}')
		.pipe(gulpCached('videos'))
		.pipe(gulp.dest('config.dest.video'));
});

gulp.task('copy:fonts', function () {
	return gulp
		.src('src/fonts/*.{ttf,eot,woff,woff2}')
		.pipe(gulpCached('fonts'))
		.pipe(gulp.dest('build/fonts/'));
});

gulp.task('copy', [
	'copy:img',
	'copy:pic',
	'copy:video',
	'copy:fonts'
]);

gulp.task('copy:watch', function () {
	gulp.watch(config.src.img + '/*', ['copy']);
});

// ==================================================
// Deploy
// ==================================================

gulp.task('deploy', function() {
    var remotePath = '/';
    var conn = ftp.create({
        host: 'buff.elastictech.org',
        user: args.user,
        password: args.password,
        log: gutil.log
    });
    gulp.src([
        './**/*.*',
        '!./.*',
        '!./node_modules/**/*.*'
    ])
        .pipe(conn.newer(remotePath))
        .pipe(conn.dest(remotePath));
});

// ==================================================
// Watcher
// ==================================================

gulp.task('watch', ['sass', 'css', 'browser-sync', 'nunjucks', 'copy', 'uglify'], function() {
	gulp.watch('src/img/sprite.svg');
	gulp.watch('src/img/*', ['copy:img']);
	gulp.watch('src/fonts/*', ['copy:fonts']);
	gulp.watch('src/video/*', ['copy:video']);
	gulp.watch('src/sass/**/*.scss', ['sass']);
	gulp.watch('src/css/style.css', ['css']);
	gulp.watch('src/js/*.js', ['uglify']);
	gulp.watch('src/img/svg/*.svg', ['sprite']);
	gulp.watch('src/templates/**/*.html', ['nunjucks']);
	gulp.watch('build/js/*.js', browserSync.reload);
	gulp.watch('build/*.html', browserSync.reload);
});

gulp.task('build', ['sass', 'css', 'sprite']);

gulp.task('default', ['watch']);