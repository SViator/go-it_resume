const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');
const htmlmin = require('gulp-htmlmin');



function pages() {
	return src('app/pages/*.html')
		.pipe(include({
			includePaths: 'app/components'
		}))
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true,
		}))
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/style.scss')
		.pipe(autoprefixer({overrideBrowserlist: ['last 10 version']}))
		.pipe(concat('style.min.css'))
		.pipe(scss({outputStyle: 'compressed'}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function scripts() {
	return src('app/js/main.js')
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function images() {
	return src(['app/images/src/*.*', '!app/images/src/*.svg'])
		.pipe(newer('app/images'))
		.pipe(avif({quality: 50}))
		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images'))
		.pipe(webp())
		.pipe(src('app/images/src/*.*'))
		.pipe(newer('app/images'))
		.pipe(imagemin())
		.pipe(dest('app/images'))

		.pipe(src('app/images/src/content/*.*'))
		.pipe(newer('app/images/content'))
		.pipe(avif({quality: 50}))
		.pipe(src('app/images/src/content/*.*'))
		.pipe(newer('app/images/content'))
		.pipe(webp())
		.pipe(src('app/images/src/content/*.*'))
		.pipe(newer('app/images/content'))
		.pipe(imagemin())
		.pipe(dest('app/images/content'))
}

function sprite() {
	return src('app/images/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('app/images'))
}

function fonts() {
	return src('app/fonts/src/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf']
		}))
		.pipe(src('app/fonts/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts'))
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "app/"
		}
	});
	watch(['app/components/*', 'app/pages/*'], pages)
	watch(['app/scss/**/*.scss'], styles)
	watch(['app/js/main.js'], scripts)
	watch(['app/images/src/**/*'], images)
	watch(['app/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
	return src('dist')
		.pipe(clean())
}

function building() {
	return src([
		'app/*.html',
		'app/css/style.min.css',
		'app/js/main.min.js',
		'app/images/*.*',
		'app/images/content/*.*',
		'!app/images/*.svg',
		'app/images/sprite.svg',
		'app/fonts/*.*'
	], {base: 'app'})
		.pipe(dest('dist'))
}


exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.watching = watching;
exports.building = building;


exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, images, pages, watching);