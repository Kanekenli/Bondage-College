"use strict";

// Loads the item extension properties
function InventoryItemMouthPumpGagLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { PumpLevel: 0 };
}

// Draw the item extension screen
function InventoryItemMouthPumpGagDraw() {
	DrawRect(1387, 225, 225, 275, "white");
	DrawImageResize("Assets/" + DialogFocusItem.Asset.Group.Family + "/" + DialogFocusItem.Asset.Group.Name + "/Preview/" + DialogFocusItem.Asset.Name + ".png", 1389, 227, 221, 221);
	DrawTextFit(DialogFocusItem.Asset.Description, 1500, 475, 221, "black");
	DrawText(DialogFind(Player, "PumpLevel" + DialogFocusItem.Property.PumpLevel.toString()), 1500, 600, "White", "Gray");
	DrawButton(1200, 700, 250, 65, DialogFind(Player, "DeflateIt"), "White");
	DrawButton(1550, 700, 250, 65, DialogFind(Player, "PumpIt"), "White");
	DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png");
}

// Catches the item extension clicks
function InventoryItemMouthPumpGagClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
	if ((MouseX >= 1200) && (MouseX <= 1450) && (MouseY >= 700) && (MouseY <= 765) && (DialogFocusItem.Property.PumpLevel > 0)) InventoryItemMouthPumpGagSetPump(-1);
	if ((MouseX >= 1550) && (MouseX <= 1800) && (MouseY >= 700) && (MouseY <= 765) && (DialogFocusItem.Property.PumpLevel < 4)) InventoryItemMouthPumpGagSetPump(1);
}

// Sets the pump gag level
function InventoryItemMouthPumpGagSetPump(Modifier) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	DialogFocusItem.Property.PumpLevel = DialogFocusItem.Property.PumpLevel + Modifier;
	if (DialogFocusItem.Property.PumpLevel == 0) delete DialogFocusItem.Property.Effect;
	if (DialogFocusItem.Property.PumpLevel == 1) DialogFocusItem.Property.Effect = ["GagLight"];
	if (DialogFocusItem.Property.PumpLevel == 2) DialogFocusItem.Property.Effect = ["GagNormal"];
	if (DialogFocusItem.Property.PumpLevel == 3) DialogFocusItem.Property.Effect = ["GagHeavy"];
	if (DialogFocusItem.Property.PumpLevel == 4) DialogFocusItem.Property.Effect = ["GagTotal"];	
	CharacterLoadEffect(C);
	if (C.ID == 0) ServerPlayerAppearanceSync();
	ChatRoomPublishCustomAction(Player.Name + " " + DialogFind(Player, ((Modifier > 0) ? "pumps" : "deflates")) + " " + C.Name + " " + DialogFind(Player, "gag") + ".", true);
}
