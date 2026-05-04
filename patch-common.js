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

	const replace = file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.gyp') || file.endsWith('.yml');

	if(!replace)
		return;

	const replacements = [];

	// Replace @img/sharp with @img-custom/sharp in .json and .js only
	replacements.push({
		search: /@img\/sharp-/g,
		replace: '@img-custom/sharp-',
	});

	if(replace)
	{
		replacements.push(
			{	// Replace lovell/sharp-libvips with ollm/sharp-libvips-custom in .json (For provenance)
				search: /lovell\/sharp-libvips/g,
				replace: 'ollm/sharp-libvips-custom',
			},
			{	// Replace lovell/sharp with ollm/sharp-custom in .json (For provenance)
				search: /lovell\/sharp/g,
				replace: 'ollm/sharp-custom',
			},
			/*{	// Replace version (Only for developing): sharp
				search: /"0\.34\.5"/g,
				replace: '"0.10.0"',
			},*/
			{	// Replace version (Only for developing): sharp-libvips
				search: /"@1\.3\.0-rc\.5"/g,
				replace: '"@1.3.0-rc.6"',
			},
			/*{	// Replace version (Only for developing): libvips
				search: /8\.17\.3/g,
				replace: '8.18.2',
			}*/
			
		);
	}

	if(file.endsWith('.gyp'))
	{
		replacements.push(
			{
				search: /(\['OS\s*==\s*"win"',\s*{\s*'defines':\s*\[\s*'_ALLOW_KEYWORD_MACROS',\s*'_FILE_OFFSET_BITS=64'\s*\],\s*'link_settings':\s*{\s*'libraries':\s*\[[^\]]*)/g,
				replace: `$1,\n        'libglib-2.0.lib',\n        'libgobject-2.0.lib',\n        'libgio-2.0.lib'`
			},
			{
				search: /('library_dirs':\s*\[\s*'<\(sharp_libvips_lib_dir\)'\s*\],\s*'libraries':\s*\[[^\]]*)/g,
				replace: `$1,\n        'libglib-2.0.lib',\n        'libgobject-2.0.lib',\n        'libgio-2.0.lib'`
			}
		);
	}

	processFile(file, replacements);

});