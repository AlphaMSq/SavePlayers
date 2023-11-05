const Logger = require('./Log.js');

const enchantementIds = [
    "minecraft:protection",
    "minecraft:fire_protection",
    "minecraft:feather_falling",
    "minecraft:blast_protection",
    "minecraft:projectile_protection",
    "minecraft:thorns",
    "minecraft:respiration",
    "minecraft:depth_strider",
    "minecraft:aqua_affinity",
    "minecraft:sharpness",
    "minecraft:smite",
    "minecraft:bane_of_arthropods",
    "minecraft:knockback",
    "minecraft:fire_aspect",
    "minecraft:looting",
    "minecraft:efficiency",
    "minecraft:silk_touch",
    "minecraft:unbreaking",
    "minecraft:fortune",
    "minecraft:power",
    "minecraft:punch",
    "minecraft:flame",
    "minecraft:infinity",
    "minecraft:luck_of_the_sea",
    "minecraft:lure",
    "minecraft:frost_walker",
    "minecraft:mending",
    "minecraft:binding_curse",
    "minecraft:vanishing_curse",
    "minecraft:impaling",
    "minecraft:riptide",
    "minecraft:loyalty",
    "minecraft:channeling",
    "minecraft:multishot",
    "minecraft:piercing",
    "minecraft:quick_charge",
    "minecraft:soul_speed",
    "minecraft:swift_sneak"
];

const potionsIds = [
    'minecraft:water',
    'minecraft:mundane',
    'minecraft:long_mundane',
    'minecraft:thick',
    'minecraft:awkward',
    'minecraft:night_vision',
    'minecraft:long_night_vision',
    'minecraft:invisibility',
    'minecraft:long_invisibility',
    'minecraft:leaping',
    'minecraft:long_leaping',
    'minecraft:strong_leaping',
    'minecraft:fire_resistance',
    'minecraft:long_fire_resistance',
    'minecraft:swiftness',
    'minecraft:long_swiftness',
    'minecraft:strong_swiftness',
    'minecraft:slowness',
    'minecraft:long_slowness',
    'minecraft:water_breathing',
    'minecraft:long_water_breathing',
    'minecraft:healing',
    'minecraft:strong_healing',
    'minecraft:harming',
    'minecraft:strong_harming',
    'minecraft:poison',
    'minecraft:long_poison',
    'minecraft:strong_poison',
    'minecraft:regeneration',
    'minecraft:long_regeneration',
    'minecraft:strong_regeneration',
    'minecraft:strength',
    'minecraft:long_strength',
    'minecraft:strong_strength',
    'minecraft:weakness',
    'minecraft:long_weakness',
    'minecraft:wither',
    'minecraft:turtle_master',
    'minecraft:long_turtle_master',
    'minecraft:strong_turtle_master',
    'minecraft:slow_falling',
    'minecraft:long_slow_falling',
    'minecraft:strong_slowness'
];

const convertItem = (it) => {
    const item = JSON.parse(it);
    if(-1 != item.Name.indexOf('shulker_box')) {
        return convertShulker(it);
    }

    const damage = item.Damage ? item.Damage : false;

    const data = {
        id: item.Name,
        Count: item.Count,
        tag: {
            Damage: damage
        }
    };

    if (["minecraft:potion", "minecraft:splash_potion", "minecraft:lingering_potion"].includes(item.Name)) {
        data.tag.Potion = potionsIds[damage];
        delete data.tag.Damage;
    }

    if (["minecraft:nether_brick", "minecraft:red_nether_brick"].includes(item.Name)) {
        data.id = item.Name + 's';
    } 

    if (["minecraft:slime"].includes(item.Name)) {
        data.id = item.Name + '_block';
    } 

    if(damage === false) {
        delete data.tag.Damage;
    }

    let enchantments = [];
    if (item.tag && item.tag.ench) {
        for (const ench of item.tag.ench) {
            enchantments.push({
                id: enchantementIds[ench.id],
                lvl: ench.lvl
            });
        }
    }

    if (enchantments.length > 0) {
        data.tag.Enchantments = enchantments;
    }

    return JSON.stringify(data);
};

const convertShulker = (it) => {
    const item = JSON.parse(it);
    const shulkerType = item.Name.replace('undyed_shulker_box', 'shulker_box')

    const data = {
        id: shulkerType,
        Count: item.Count,
    };

    let items = [];
    if (item.tag && item.tag.Items) {
        for (const sItem of item.tag.Items) {
            const damage = sItem.Damage ? sItem.Damage : false;
            let itemData = {
                Count: sItem.Count,
                Slot: sItem.Slot,
                id: sItem.Name,
                tag: {
                    Damage: damage
                }
            };

            if (["minecraft:potion", "minecraft:splash_potion", "minecraft:lingering_potion"].includes(sItem.Name)) {
                itemData.tag.Potion = potionsIds[damage];
                delete itemData.tag.Damage;
            }
        
            if (["minecraft:nether_brick", "minecraft:red_nether_brick"].includes(sItem.Name)) {
                itemData.id = sItem.Name + 's';
            } 
        
            if (["minecraft:slime"].includes(sItem.Name)) {
                itemData.id = sItem.Name + '_block';
            } 

            if(damage === false) {
                delete itemData.tag.Damage;
            }

            if (sItem.tag && sItem.tag.ench) {
                let enchantments = [];
                for (const ench of sItem.tag.ench) {
                    enchantments.push({
                        id: enchantementIds[ench.id],
                        lvl: ench.lvl
                    });
                }
                if (enchantments.length > 0) {
                    itemData.tag.Enchantments = enchantments;
                }
            }

            items.push(itemData);
        }
    }

    if (items.length > 0) {
        data.tag = {
            BlockEntityTag: {
                Items: items,
                id: shulkerType
            }
        };
    }

    return JSON.stringify(data);
};

module.exports = { convertItem, convertShulker };