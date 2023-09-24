const fs = require("fs");
const path = require('path')

/**
 * Значения конфигурации по умолчанию.
 * @type {{asyncWrite: boolean, syncOnWrite: boolean, jsonSpaces: number}}
*/
const defaultOptions = {
    asyncWrite: false,
    syncOnWrite: true,
    jsonSpaces: 4,
    stringify: JSON.stringify,
    parse: JSON.parse,
};

/**
 * Проверяет содержимое JSON-файла.
 * @param {string} fileContent
 * @returns {boolean} `true`, если содержимое корректно, в противном случае генерирует ошибку.
*/
let validateJSON = function (fileContent) {
    try {
        this.options.parse(fileContent);
    } catch (e) {
        console.error(
            "Указанный файл не пуст, и его содержимое не является корректным JSON."
        );
        throw e;
    }
    return true;
};

/**
 * Класс для работы с JSON-базой данных.
*/
class JSONdb {
    /**
     * Основной конструктор, управляет существующим файлом хранилища и анализирует параметры на основе параметров по умолчанию.
     * @param {string} filePath Путь к файлу, который будет использоваться в качестве хранилища.
     * @param {object} [filePath] Параметры конфигурации.
     * @param {boolean} [options.asyncWrite] Включает асинхронную запись хранилища на диск. По умолчанию выключено (синхронное поведение).
     * @param {boolean} [options.syncOnWrite] При каждом изменении хранилища выполняется запись на диск. По умолчанию включено.
     * @param {number} [options.jsonSpaces] Количество пробелов для форматирования выходных JSON-файлов. По умолчанию = 4.
    */
    constructor(filePath, options){
        if (typeof filePath !== "string") {
            throw new Error("Недопустимый путь к файлу");
        } else if (filePath.endsWith(".json")) {
            this.filePath = filePath;
        } else {
            this.filePath = `${filePath}.json`;
        }

        this.options = options || defaultOptions;

        this.storage = {};

        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        let stats;
        try {
            stats = fs.statSync(filePath);
        } catch (err) {
            if (err.code === "ENOENT") {
                return;
            } else if (err.code === "EACCES") {
                throw new Error(`Невозможно получить доступ к пути "${filePath}".`);
            } else {
                throw new Error(`Ошибка при проверке существования пути "${filePath}": ${err}`);
            }
        }

        try {
            fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
        } catch (err) {
            throw new Error(`Невозможно читать и записывать по пути "${filePath}". Проверьте разрешения!`);
        }

        if (stats.size > 0) {
            let data;
            try {
                data = fs.readFileSync(filePath);
            } catch (err) {
                throw err;
            }
            if (validateJSON.bind(this)(data)) this.storage = this.options.parse(data);
        }
    }

    /**
     * Инициализирует значение по ключу, если оно отсутствует в хранилище.
     * @param {string} key - Ключ для создания или изменения.
     * @param {object} value - Значение для хранения в ключе. Может быть любым JSON-совместимым объектом.
    */
    init(key, value) {
        if (!this.storage.hasOwnProperty(key)) {
            this.storage[key] = value;
            if (this.options && this.options.syncOnWrite) this.sync();
        }
    }

    /**
     * Создает или изменяет ключ в базе данных.
     * @param {string} key Ключ для создания или изменения.
     * @param {object} value Значение для хранения в ключе. Может быть любым JSON-совместимым объектом
    */
    set (key, value) {
        this.storage[key] = value;
        if (this.options && this.options.syncOnWrite) this.sync();
    };

    /**
     * Извлекает значение ключа из базы данных.
     * @param {string} key Ключ для поиска.
     * @returns {object|undefined} Значение ключа или `undefined`, если ключ не существует
    */
    get (key) {
        return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
    };

    /**
     * Проверяет, содержится ли ключ в базе данных.
     * @param {string} key Ключ для поиска.
     * @returns {boolean} `true`, если ключ существует, `false`, если нет.
    */
    has (key) {
        return this.storage.hasOwnProperty(key);
    };
    
    /**
     * Удаляет ключ из базы данных.
     * @param {string} key Ключ для удаления.
     * @returns {boolean|undefined} `true`, если удаление успешно, `false`, если произошла ошибка, или `undefined`, если ключ не был найден.
    */
    delete (key) {
        let retVal = this.storage.hasOwnProperty(key) ? delete this.storage[key] : undefined;
        if (this.options && this.options.syncOnWrite) this.sync();
        return retVal;
    };

    /**
     * Удаляет все ключи из базы данных.
     * @returns {object} Экземпляр JSONdb.
    */
    deleteAll = function () {
        for (var key in this.storage) {
            this.delete(key);
        }
        return this;
    };

    /**
     * Записывает локальный объект хранилища на диск.
    */
    sync () {
        if (this.options && this.options.asyncWrite) {
            fs.writeFile(this.filePath, this.options.stringify(this.storage, null, this.options.jsonSpaces), (err) => {if (err) throw err;});
        } else {
            try {
                fs.writeFileSync(this.filePath, this.options.stringify(this.storage, null, this.options.jsonSpaces));
            } catch (err) {
                if (err.code === "EACCES") {
                    throw new Error(`Невозможно получить доступ к пути "${this.filePath}".`);
                } else {
                    throw new Error(`Ошибка при записи по пути "${this.filePath}": ${err}`);
                }
            }
        }
    };

    /**
     * Если параметр не задан, возвращает **копию** локального хранилища. Если задан объект, он используется для замены локального хранилища.
     * @param {object} storage JSON-объект для замены локального хранилища.
     * @returns {object} Клон внутреннего JSON-хранилища. `Error`, если передан параметр, и он не является корректным JSON-объектом.
    */
    JSON (storage) {
        if (storage) {
            try {
                JSON.parse(this.options.stringify(storage));
                this.storage = storage;
            } catch (err) {
                throw new Error("Указанный параметр не является корректным JSON-объектом.");
            }
        }
        return JSON.parse(this.options.stringify(this.storage));
    };
}

module.exports = JSONdb;