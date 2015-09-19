var config = {
	dest: 'www',
	tmp: 'tmp',
	/**
	 *  Don't generate sourcemaps
	 *  Set appProduction to true
	 *  Set appVersion to package.json version
	 */
	production: true,

	src: {
		/* warning: beware of ./app/bower_components */
		css: ['./app/css/*.css'],
		js: ['./app/src/**/*.js'],
		views: ['./app/src/**/view/*.html'],
		images: ['./app/images/*.png'],
		launcher: ['./assets/launcher/**/*.png']
	}
};

var pkg = require('./package.json');
var banner = [
  '/*!',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

/* requirements */
var gulp 			= require('gulp'),
    inject 			= require('gulp-inject'),
    ngFilesort 		= require('gulp-angular-filesort'),
    replace 		= require('gulp-replace'),
    templateCache 	= require('gulp-angular-templatecache'),
    ngAnnotate 		= require('gulp-ng-annotate'),
	concat         	= require('gulp-concat'),
	sourcemaps     	= require('gulp-sourcemaps'),
	uglify         	= require('gulp-uglify'),
	cssmin			= require('gulp-cssmin'),
	rename         	= require('gulp-rename'),
	streamqueue    	= require('streamqueue'),
	path 			= require('path');
	del 			= require('del'),
	sequence 		= require('run-sequence'),
	bower 			= require('main-bower-files'),
	filter 			= require('gulp-filter'),
	header 			= require('gulp-header'),
	optipng			= require('imagemin-optipng'),
	gulpif			= require('gulp-if');

/* refresh sources in index.html */
gulp.task('index', function() {
  var target = gulp.src('./app/index.html');
  var sources = streamqueue({ objectMode: true },
    gulp.src(bower(), {read: false}),
	gulp.src(config.src.css, {read: false}),
	gulp.src(config.src.js).pipe(ngFilesort())
  );
  return target.pipe(inject(sources, {relative: true}))
    .pipe(gulp.dest('./app'));
});

/* cleanup generated files */
gulp.task('clean', function() {
  del.sync([
    path.join(config.dest, 'index.html'),
    path.join(config.dest, 'images'),
    path.join(config.dest, 'res'),
    path.join(config.dest, 'icons'),
    path.join(config.dest, 'css'),
    path.join(config.dest, 'js'),
    path.join(config.dest, 'fonts')
  ]);
});

/* optimize images */
gulp.task('images', function() {
  return gulp.src(config.src.images)
    .pipe(optipng()())
    .pipe(gulp.dest(path.join(config.dest, 'images')));
});

/* optimize launcher images */
gulp.task('launcher', function() {
  return gulp.src(config.src.launcher)
    .pipe(optipng()())
    .pipe(gulp.dest(path.join(config.dest, 'res')));
});

/* compile and minify js */
gulp.task('js', function() {
    return streamqueue({ objectMode: true },
	  gulp.src(path.join(config.tmp, '*.js')),
      gulp.src(config.src.js).pipe(ngFilesort()).pipe(replace('./src/', '')),
      gulp.src(config.src.views).pipe(templateCache({ module: 'redmineApp' }))
    )
	.pipe(gulpif('**/app.js' && config.production, replace(/appProduction',\s*\w+/, 'appProduction\', true')))
	.pipe(gulpif('**/app.js' && config.production, replace(/appVersion',[\s\w\d.']+/, 'appVersion\', \''+pkg.version+'\'')))
    .pipe(gulpif(!config.production, sourcemaps.init()))
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(!config.production, sourcemaps.write('.')))
	.pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(path.join(config.dest, 'js')));
});

/* compile and minify css */
gulp.task('css', function() {
    return streamqueue({ objectMode: true },
	  gulp.src(path.join(config.tmp, '*.css')),
      gulp.src(config.src.css)
    )
    .pipe(gulpif(!config.production, sourcemaps.init()))
    .pipe(concat('app.css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(!config.production, sourcemaps.write('.')))
	.pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(path.join(config.dest, 'css')));
});

/**
 * Bower components
 * concat *.js to `vendor.js`
 * concat *.css to `vendor.css`
 * rename fonts to `fonts/*.*`
 */
gulp.task('bower', function() {
	var jsFilter = filter('**/*.js', {restore: true});
	var cssFilter = filter('**/*.css', {restore: true});
	return gulp.src(bower())
		.pipe(jsFilter)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(config.tmp))
		.pipe(jsFilter.restore)
		.pipe(cssFilter)
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest(config.tmp))
		.pipe(cssFilter.restore)
		.pipe(rename(function(path) {
			if (~path.dirname.indexOf('fonts')) {
				path.dirname = '/fonts'
			}
		}));
});

/* distribution index.html */
gulp.task('html', function() {
	var target = gulp.src('./app/index.html').pipe(gulp.dest(config.dest));

	var sources = gulp.src([
		path.join(config.dest, 'js/*.js'),
		path.join(config.dest, 'css/*.css'),
	], {read: false});
	var extra = ['<script src="cordova.js"></script>'];

	return target
		.pipe(replace('<!-- inject:extra -->', extra.join('\n    ')))
		.pipe(inject(sources, {relative: true}))
		.pipe(gulp.dest(config.dest));
});

/* run all steps to prepare the distribution folder */
gulp.task('build', function(cb) {
	sequence(
		'clean',
		['bower', 'images', 'launcher'],
		['js', 'css'],
		'html',
		cb);
});
