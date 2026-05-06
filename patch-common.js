const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function walk(dir, callback)
{
	const entries = fs.readdirSync(dir, {withFileTypes: true});

	for(const entry of entries)
	{
		const fullPath = path.join(dir, entry.name);

		// Skip .git
		if(entry.name === '.git')
			continue;

		if(fullPath.includes('/custom/patch-common.js') || fullPath.includes('/custom/.github'))
			continue;

		if(entry.isDirectory())
			walk(fullPath, callback);
		else if(entry.isFile())
			callback(fullPath);
	}
}

// Apply replacements to a file
function processFile(filePath, replacements)
{
	const content = fs.readFileSync(filePath, 'utf8');
	let updated = content;

	for(const {search, replace} of replacements)
	{
		updated = updated.replace(search, replace);
	}

	if(updated !== content)
	{
		fs.writeFileSync(filePath, updated, 'utf8');
		console.log(`Updated: ${filePath}`);
	}
}

walk(ROOT, (file) => {

	const replace = file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs') || file.endsWith('.gyp') || file.endsWith('.yml');

	if(!replace)
		return;

	const replacements = [];

	// Replace @img/sharp with @img-custom/sharp
	replacements.push({
		search: /@img\/sharp-/g,
		replace: '@img-custom/sharp-',
	});

	if(replace)
	{
		// TODO: Apply only to specific files and abort if they don't match; using this approach for now.
		replacements.push(
			{	// Replace lovell/sharp-libvips with ollm/sharp-libvips-custom in .json (For provenance)
				search: /lovell\/sharp-libvips/g,
				replace: 'ollm/sharp-libvips-custom',
			},
			{	// Replace lovell/sharp with ollm/sharp-custom in .json (For provenance)
				search: /lovell\/sharp/g,
				replace: 'ollm/sharp-custom',
			},
			{	// Add all Windows dll
				search: /\(name\.startsWith\('libvips-'\)\s*&&\s*name\.endsWith\('\.dll'\)\);/g,
				replace: '(name.startsWith(\'libvips-\') && name.endsWith(\'.dll\')) ||\n      (name.endsWith(\'.dll\'));',
			},
			{	// Test
				search: /filter: \(file\) => \{/g,
				replace: 'filter: (file) => {console.log(\'File:\', file);',
			},
			{	// Replace version (Only for developing): sharp
				search: /"0\.35\.0-rc\.[0-9]+"/g,
				replace: '"0.11.3"',
			},
			{	// Replace version (Only for developing): sharp-libvips
				search: /"1\.3\.0-rc\.[0-9]+"/g,
				replace: '"1.3.0-rc.6-2"',
			},
			{	// Replace version (Only for developing): libvips
				search: /8\.17\.3/g,
				replace: '8.18.2',
			}
		);
	}

	// TODO: Apply only to specific files and abort if they don't match; using this approach for now.
	if(file.endsWith('.gyp'))
	{
		const lib = [
			'libIex-3_1.lib',
			'libIlmThread-3_1.lib',
			'libMagickCore-6.Q16.lib',
			'libOpenEXR-3_1.lib',
			'libaom.lib',
			'libarchive.lib',
			'libbrotlicommon.lib',
			'libbrotlidec.lib',
			'libbrotlienc.lib',
			'libc++.lib',
			'libcairo.lib',
			'libcfitsio.lib',
			'libcgif.lib',
			'libdicom.lib',
			'libexif.lib',
			'libexpat.lib',
			'libffi.lib',
			'libfftw3.lib',
			'libfontconfig.lib',
			'libfreetype.lib',
			'libfribidi.lib',
			'libgdk_pixbuf-2.0.lib',
			'libgio-2.0.lib',
			'libglib-2.0.lib',
			'libgmodule-2.0.lib',
			'libgobject-2.0.lib',
			'libharfbuzz.lib',
			'libheif.lib',
			'libhwy.lib',
			'libimagequant.lib',
			'libjpeg.lib',
			'libjxl.lib',
			'libjxl_cms.lib',
			'libjxl_threads.lib',
			'liblcms2.lib',
			'libmatio.lib',
			'libniftiio.lib',
			'libopenjp2.lib',
			'libopenslide.lib',
			'libpango-1.0.lib',
			'libpangocairo-1.0.lib',
			'libpangoft2-1.0.lib',
			'libpixman-1.lib',
			'libpng16.lib',
			'libpoppler-glib.lib',
			'libpoppler.lib',
			'libraw_r.lib',
			'librsvg-2.lib',
			'libsharpyuv.lib',
			'libsqlite3.lib',
			'libtiff.lib',
			'libuhdr.lib',
			'libunwind.lib',
			'libvips-cpp.lib',
			'libvips.lib',
			'libwebp.lib',
			'libwebpdemux.lib',
			'libwebpmux.lib',
			'libxml2.lib',
			'libz1.lib',
			'libznz.lib',
			'libzstd.lib',
		];
		const dll = [
			'libIex-3_1.dll',
			'libIlmThread-3_1.dll',
			'libMagickCore-6.Q16-7.dll',
			'libOpenEXR-3_1.dll',
			'libaom.dll',
			'libarchive-13.dll',
			'libbrotlicommon.dll',
			'libbrotlidec.dll',
			'libbrotlienc.dll',
			'libc++.dll',
			'libcairo-2.dll',
			'libcfitsio.dll',
			'libcgif-0.dll',
			'libdicom-1.dll',
			'libexif-12.dll',
			'libexpat-1.dll',
			'libffi-8.dll',
			'libfftw3-3.dll',
			'libfontconfig-1.dll',
			'libfreetype-6.dll',
			'libfribidi-0.dll',
			'libgdk_pixbuf-2.0-0.dll',
			'libgio-2.0-0.dll',
			'libglib-2.0-0.dll',
			'libgmodule-2.0-0.dll',
			'libgobject-2.0-0.dll',
			'libharfbuzz-0.dll',
			'libheif.dll',
			'libhwy.dll',
			'libimagequant.dll',
			'libjpeg-62.dll',
			'libjxl.dll',
			'libjxl_cms.dll',
			'libjxl_threads.dll',
			'liblcms2-2.dll',
			'libmatio-14.dll',
			'libniftiio.dll',
			'libopenjp2.dll',
			'libopenslide-1.dll',
			'libpango-1.0-0.dll',
			'libpangocairo-1.0-0.dll',
			'libpangoft2-1.0-0.dll',
			'libpixman-1-0.dll',
			'libpng16-16.dll',
			'libpoppler-158.dll',
			'libpoppler-glib-8.dll',
			'libraw_r-24.dll',
			'librsvg-2-2.dll',
			'libsharpyuv-0.dll',
			'libsqlite3-0.dll',
			'libtiff-6.dll',
			'libuhdr.dll',
			'libunwind.dll',
			'libvips-42.dll',
			'libwebp-7.dll',
			'libwebpdemux-2.dll',
			'libwebpmux-3.dll',
			'libxml2-16.dll',
			'libz1.dll',
			'libznz.dll',
			'libzstd.dll',
		];

		replacements.push(
			{
				search: /(\['OS\s*==\s*"win"',\s*{\s*'defines':\s*\[\s*'_ALLOW_KEYWORD_MACROS',\s*'_FILE_OFFSET_BITS=64',\s*'_HAS_EXCEPTIONS=1'\s*\],\s*'link_settings':\s*{\s*'libraries':\s*\[\s*)[^\]\s]*/g,
				replace: `$1${lib.map(name => `'${name}'`).join(',\n        ')}`,
			},
			{
				search: /('library_dirs':\s*\[\s*'<\(sharp_libvips_lib_dir\)'\s*\],\s*'libraries':\s*\[\s*)[^\]\s]*/g,
				replace: `$1${lib.map(name => `'${name}'`).join(',\n        ')}`,
			},
			{
				search: /'\<\(sharp_libvips_lib_dir\)\/libvips-42\.dll'/g,
				replace: dll.map(name => `'<(sharp_libvips_lib_dir)/${name}'`).join(',\n        '),
			}
		);
	}

	processFile(file, replacements);

});
