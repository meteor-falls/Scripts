hlr.items = {}
hlr.itemstore = null
itemCbs = []

class hlr.Item
    constructor: ({@id, @name, @desc, @slot, @classes}) ->
        @attributes = []

    # Slots
    @Primary: 0
    @Secondary: 1
    @Melee: 2
    @Cosmetic: 3
    @Misc: 4
    @Taunt: 5

    # Quality:
    @Unique: 0
    @Genuine: 1

    # Other things
    @NoItem: -1

class hlr.InventoryItem
    constructor: ({@item, @id, @quality}) ->
    toJSON: -> {@item, @id, @quality}
    name: -> "#{if @quality is hlr.Item.Unique then '' else hlr.itemQualityName(@quality) + ' '}#{hlr.item(@item).name}"

hlr.itemSlotName = (slot) ->
    item = hlr.Item
    return switch slot
        when item.Primary then "Primary"
        when item.Secondary then "Secondary"
        when item.Melee then "Melee"
        when item.Cosmetic then "Cosmetic"
        when item.Misc then "Misc"
        when item.Taunt then "Taunt"
        else hlr.error("hlr.itemSlotName: unknown item slot #{slot}")

hlr.itemQualityName = (quality) ->
    item = hlr.Item
    return switch quality
        when item.Unique then "Unique"
        when item.Genuine then "Genuine"
        else hlr.error("hlr.itemQualityName: unknown item quality #{quality}")

hlr.item = (id) -> hlr.items[id]
hlr.registerItem = (item) -> hlr.items[item.id] = item
hlr.makeItem = ({id, name, desc, classes, slot}) ->
    desc ?= ""
    classids = []
    for clas in classes
        classids.push hlr.class(clas).idc

    hlr.registerItem(new hlr.Item({id, name, desc, classes: classids, slot}))

hlr.createItem = ({item, quality}) ->
    unless item
        hlr.error("hlr.createItem: no item given")
    unless quality
        hlr.error("hlr.createItem: no quality given")

    item = new hlr.InventoryItem({item, id: hlr.itemstore.uniqid, quality})

    hlr.itemstore.uniqid += 1
    return item

hlr.addItems = (cb) ->
    if cb
        itemCbs.push(cb)
    else
        (adds() for adds in itemCbs)
    return null

hlr.initItemStorage = ->
    class ItemJsonStore extends hlr.JsonStore
        initDefaults: ->
            @hash.uniqid ?= 0

    hlr._itemjsonstore = new ItemJsonStore("hlr-items.json")
    hlr.itemstore = hlr._itemjsonstore.hash
