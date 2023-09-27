const data = {
    "Count": new NbtInt(1),
    "Damage": new NbtInt(0),
    "Name": new NbtString("stick"),
    "WasPickedUp": new NbtInt(0),
    "name4": new NbtLong(66666)
}



const nbt = new NbtCompound([data])
const it = mc.newItem(nbt)