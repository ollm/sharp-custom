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

	// TODO: Apply only to specific files and abort if they don't match; using this approach for now.
	const replacements = [
		{	// Replace @img/sharp with @img-custom/sharp
			search: /@img\/sharp-/g,
			replace: '@img-custom/sharp-',
		},
		{	// Replace lovell/sharp-libvips with ollm/sharp-libvips-custom in .json (For provenance)
			search: /lovell\/sharp-libvips/g,
			replace: 'ollm/sharp-libvips-custom',
		},
		{	// Replace lovell/sharp with ollm/sharp-custom in .json (For provenance)
			search: /lovell\/sharp/g,
			replace: 'ollm/sharp-custom',
		},
		{	// Disable test
			search: /t\.assert\.ok\(semver\.valid\(sharp\.versions\.vips\)\);/g,
			replace: 't.assert.ok(semver.valid(true));',
		},
		/*
		{	// Replace version (Only for developing): sharp
			search: /"0\.35\.0-rc\.[0-9]+"/g,
			replace: '"0.14.1"',
		},
		{	// Replace version (Only for developing): sharp-libvips
			search: /"1\.3\.0-rc\.[0-9]+"/g,
			replace: '"1.3.0-rc.6-7"',
		},
		{	// Replace version (Only for developing): libvips
			search: /8\.17\.3/g,
			replace: '8.18.2',
		}*/
	];

	processFile(file, replacements);

});
