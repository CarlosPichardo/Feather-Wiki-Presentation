/**
 * This file was created by jcoder and is lightly modified from its original source code at
 * https://codeberg.org/jcoder/FeatherWikiExamples/src/branch/main/SunEditorExtension.js
 * It loads the latest version SunEditor (https://github.com/JiHong88/SunEditor) from the JSDelivr CDN
 * and replaces the default Feather Wiki HTML editor on the Render event.
 */
FW.ready(() => {
  const { state, emitter } = FW;
	const { RENDER } = state.events;
	console.log('running sunEditorextension ');

	const css = document.createElement('link');
	css.rel="stylesheet";
	css.href="./extensions/v1.9.x/suneditor/suneditor.min.css";
	document.head.appendChild(css);

	const script = document.createElement('script');
	script.onload = () => { emitter.emit(RENDER) }
	script.type="text/javascript";
	script.src="./extensions/v1.9.x/suneditor/suneditor.min.js";
	document.head.appendChild(script);

	emitter.on(RENDER, () => {
		setTimeout(() => {
			sunEditor();
		}, 50);
	});

	function sunEditor() {
		if (typeof SUNEDITOR === 'undefined') return; // CDN not available: keep the default editor
		if (!state.edits || state.edits.editor === 'md') return;
		const target = document.getElementById('e');
		if (!target || document.querySelector('.sun-editor')) return;
		const editor = SUNEDITOR.create(target, {
			value: state.edits.content,
			buttonList: [
				['undo', 'redo'],
				['font', 'fontSize', 'formatBlock'],
				['paragraphStyle', 'blockquote'],
				['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
				['fontColor', 'hiliteColor', 'textStyle','lineHeight'],
				['removeFormat'],
				['outdent', 'indent'],
				['align', 'horizontalRule', 'list'],
				['table', 'link'],
				['fullScreen', 'showBlocks', 'codeView']
			],
		});
		editor.onChange = function (contents, core) { state.edits.content = contents; }
		editor.setDefaultStyle('font-family: Arial; font-size: 14px;');
	}
});
