/**
 * Регистрирует плагин SavePlayers и устанавливает обработчик команды "saveinv".
 *
 * @param {string} name - Имя плагина.
 * @param {string} description - Описание плагина.
 * @param {Array} version - Версия плагина в формате [major, minor, patch].
 * @param {object} options - Дополнительные опции плагина.
 * @param {string} options.Author - Автор плагина.
 */
ll.registerPlugin('SavePlayers', 'Save players pos and inventory', [1, 0, 0], {
    Author: 'Alpha',
});

const Logger = require('./methods/Log.js');
const DB = require('./methods/DB.js');
const { convertItem, convertShulker } = require('./methods/ConvertBE2JE.js');
const fs = require('fs');

/**
 * Записывает данные в файл JSON.
 *
 * @param {string} filePath - Путь к файлу JSON, в который будут записаны данные.
 * @param {object} data - Данные для записи в файл.
 * @returns {Promise<boolean>} - Возвращает промис, который разрешается в `true`, если запись прошла успешно, иначе в `false`.
 */
function writeJsonToFile(filePath, data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data, null, 4); // Форматируем JSON с отступами для читаемости
        fs.writeFile(filePath, jsonData, (error) => {
            if (error) {
                Logger.error(`Ошибка при записи в файл JSON: ${error.message}`);
                reject(false);
            } else {
                Logger.log(`Данные успешно записаны в файл JSON: ${filePath}`);
                resolve(true);
            }
        });
    });
}

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("saveinv", "Save players pos and inventory", PermType.GameMasters);
    cmd.overload([]);

    /**
     * Обработчик команды "saveinv". Сохраняет инвентари игроков и сообщает об этом.
     *
     * @param {object} cmd - Объект команды.
     * @param {object} ori - Информация о вызвавшем команду игроке.
     * @param {string} out - Сообщение, которое будет отправлено в лог.
     * @param {object} res - Результат выполнения команды.
     */
    cmd.setCallback((cmd, ori, out, res) => {
        const originPlayer = ori.player;
        logOut(`Начинаю сохранение инвентарей игроков!`, [originPlayer]);

        mc.getOnlinePlayers().forEach(async (pl) => {
            const result = await saveInventory(pl);
            if (result) {
                logOut(`@${pl.realName}, твой инвентарь сохранён. Теперь я знаю все твои грязные секреты!`, [originPlayer, pl], false);
            } else {
                logOut(`Ошибка при сохранении инвентаря игрока ${pl.realName}`, [originPlayer], true);
            }
        });
    });
    cmd.setup();
});

/**
 * Записывает сообщение в лог и отправляет его игрокам.
 *
 * @param {string} out - Сообщение для записи и отправки.
 * @param {Array} pls - Массив игроков, которым нужно отправить сообщение.
 * @param {string} err - Флаг ошибки. Если установлен в `true`, сообщение будет записано как ошибка.
 */
const logOut = (out, pls, err) => {
    if (err) {
        Logger.error(out);
        pls.forEach((pl) => {
            pl.tell(out);
        });
    } else {
        Logger.info(out);
        pls.forEach((pl) => {
            pl.tell(out);
        });
    }
}

/**
 * Сохраняет информацию об инвентаре и позиции игрока в файл JSON.
 *
 * @param {object} pl - Игрок, инвентарь которого нужно сохранить.
 * @returns {Promise<boolean>} - Возвращает промис, который разрешается в `true`, если сохранение прошло успешно, иначе в `false`.
 */
const saveInventory = async (pl) => {
    try {
        const pos = pl.pos;

        const inv = pl.getInventory();
        const echest = pl.getEnderChest();
        const armor = pl.getArmor();

        const allInvItems = inv.getAllItems();
        const allEchestItems = echest.getAllItems();
        const allArmorItems = armor.getAllItems();

        let allInvItemsNBT = {};
        let itSlot = 1;
        await Promise.all(
            allInvItems.map(async (it) => {
                const nbt = it.getNbt().toString();
                const parsedNBTString = nbt;
                const convertedItem = convertItem(parsedNBTString);
                allInvItemsNBT[itSlot] = convertedItem;
                itSlot++;
            })
        );

        let allEchestItemsNBT = {};
        let itECSlot = 1;
        await Promise.all(
            allEchestItems.map(async (it) => {
                const nbt = it.getNbt().toString();
                const parsedNBTString = nbt
                const convertedItem = convertItem(parsedNBTString);
                allEchestItemsNBT[itECSlot] = convertedItem;
                itECSlot++;
            })
        );

        let allArmorItemsNBT = {};
        let itArmorSlot = 36;
        await Promise.all(
            allArmorItems.map(async (it) => {
                const nbt = it.getNbt().toString();
                const parsedNBTString = nbt;
                const convertedItem = convertItem(parsedNBTString);
                allArmorItemsNBT[itArmorSlot] = convertedItem;
                itArmorSlot++;
            })
        );

        writeJsonToFile(`./plugins/SavePlayers/player-${pl.realName}.json`, {
            data: {
                pos: { x: pos.x.toFixed(0), y: pos.y.toFixed(0), z: pos.z.toFixed(0) },
                inv: allInvItemsNBT,
                echest: allEchestItemsNBT,
                armor: allArmorItemsNBT,
            }
        });

        return true;
    } catch (error) {
        Logger.error(`Ошибка при сохранении инвентаря игрока: ${error.message}`);
        console.log(error);
        return false;
    }
};