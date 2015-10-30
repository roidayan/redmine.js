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
		css: ['./app/assets/*.css'],
		js: ['./app/src/**/*.js'],
		views: ['./app/src/**/view/*.html'],
		images: ['./app/assets/images/*.png'],
		launcher: ['./assets/launcher/**/*.png'],
		fonts: ['./app/assets/fonts/*']
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
	path 			= require('path'),
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
    path.join(config.dest, 'res'),
    path.join(config.dest, 'assets')
  ]);
});

/* optimize images */
gulp.task('images', function() {
  return gulp.src(config.src.images)
    .pipe(optipng()())
    .pipe(gulp.dest(path.join(config.dest, 'assets/images')));
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
	.pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(rename({suffix: '.min'}))
	.pipe(header(banner, {pkg: pkg}))
    .pipe(gulpif(!config.production, sourcemaps.write('.')))
    .pipe(gulp.dest(path.join(config.dest, 'assets')));
});

/* compile and minify css */
gulp.task('css', function() {
    return streamqueue({ objectMode: true },
	  gulp.src(path.join(config.tmp, '*.css')),
      gulp.src(config.src.css)
    )
    .pipe(gulpif(!config.production, sourcemaps.init()))
	.pipe(cssmin())
    .pipe(concat('app.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(!config.production, sourcemaps.write('.')))
	.pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest(path.join(config.dest, 'assets')));
});

/* copy fonts */
gulp.task('fonts', function() {
  return gulp.src(config.src.fonts)
    .pipe(gulp.dest(path.join(config.dest, 'assets/fonts')));
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
				path.dirname = '/fonts';
			}
		}));
});

/* distribution index.html */
gulp.task('html', function() {
	var target = gulp.src('./app/index.html').pipe(gulp.dest(config.dest));

	var sources = gulp.src([
		path.join(config.dest, 'assets/*.js'),
		path.join(config.dest, 'assets/*.css'),
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
