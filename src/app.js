// --- 書類種別の取得 ---
function getSelectedDocType() {
	const radios = document.getElementsByName('docType');
	for (const radio of radios) {
		if (radio.checked) return radio.value;
	}
	return 'plan'; // デフォルト
}
// --- S: Single Responsibility Principle ---
class CsvFileReader {
	constructor(inputElement) {
		this.inputElement = inputElement;
	}
	readFile(callback) {
		this.inputElement.addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (event) => {
				callback(event.target.result);
			};
			reader.readAsText(file);
		});
	}
}

// --- O: Open/Closed Principle ---
class CsvParser {
	parse(csvText) {
		// シンプルなCSVパーサ（カンマ区切り、改行対応）
		const lines = csvText.trim().split(/\r?\n/);
		const headers = lines[0].split(',');
		return lines.slice(1).map(line => {
			const values = line.split(',');
			return headers.reduce((obj, header, i) => {
				obj[header.trim()] = values[i]?.trim() || '';
				return obj;
			}, {});
		});
	}
}

// --- L: Liskov Substitution Principle ---
// 今回は拡張性のため、インターフェース的な役割を意識
class CsvPreviewRenderer {
	render(data, container) {
		if (!data.length) {
			container.innerHTML = '<em>データがありません</em>';
			return;
		}
		const table = document.createElement('table');
		table.className = 'csv-table';
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		Object.keys(data[0]).forEach(key => {
			const th = document.createElement('th');
			th.textContent = key;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);
		const tbody = document.createElement('tbody');
		data.forEach(row => {
			const tr = document.createElement('tr');
			Object.values(row).forEach(val => {
				const td = document.createElement('td');
				td.textContent = val;
				tr.appendChild(td);
			});
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		container.innerHTML = '';
		container.appendChild(table);
	}
}

// --- D: Dependency Inversion Principle ---
class CsvAppController {
	constructor(reader, parser, renderer) {
		this.reader = reader;
		this.parser = parser;
		this.renderer = renderer;
	}
	init() {
		const previewContainer = document.getElementById('csvPreview');
		this.reader.readFile((csvText) => {
			const data = this.parser.parse(csvText);
			this.renderer.render(data, previewContainer);
			// 今後: ここでAIプロンプト生成や出力処理に繋げる
		});
	}
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
	const csvInput = document.getElementById('csvInput');
	const reader = new CsvFileReader(csvInput);
	const parser = new CsvParser();
	const renderer = new CsvPreviewRenderer();
	const app = new CsvAppController(reader, parser, renderer);
	app.init();
});