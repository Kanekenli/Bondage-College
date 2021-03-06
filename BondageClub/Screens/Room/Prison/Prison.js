"use strict";
var PrisonBackground = "Prison";
var PrisonNextEventTimer = null;
var PrisonNextEvent = false;
var PrisonerMetalCuffsKey = null;

var PrisonMaid = null;
var PrisonMaidAppearance = null;
var PrisonMaidIsPresent = true;
var PrisonMaidIsAngry =false;
var PrisonMaidCharacter = null;
var PrisonMaidCharacterList = ["Friendly", "Neutral", "Evil", "Chaotic"];
var PrisonMaidChaotic = null;

var PrisonSub = null;
var PrisonSubAppearance = null;
var PrisonSubBehindBars = false;
var PrisonSubSelfCuffed = false;
var PrisonSubIsPresent = false;
var PrisonSubAskedCuff = false;
var PrisonSubIsLeaveOut = true;
var PrisonSubIsStripSearch = false;

var PrisonPlayerAppearance = null;
var PrisonPlayerBehindBars = false;
var PrisonPlayerForIllegalChange = false;

// functions for Dialogs
function PrisonPlayerIsHandcuffed() {return PrisonCharacterAppearanceAvailable(Player, "MetalCuffs", "ItemArms");}
function PrisonPlayerIsPanelGag()   {return PrisonCharacterAppearanceAvailable(Player, "HarnessPanelGag", "ItemMouth");}
function PrisonPlayerIsLegTied()    {return PrisonCharacterAppearanceAvailable(Player, "LeatherBelt", "ItemLegs");}
function PrisonPlayerIsFeetTied()   {return PrisonCharacterAppearanceAvailable(Player, "LeatherBelt", "ItemFeet");}
function PrisonPlayerIsOTMGag()     {return PrisonCharacterAppearanceAvailable(Player, "ClothOTMGag", "ItemMouth");}
function PrisonPlayerIsStriped()    {return !(PrisonCharacterAppearanceGroupAvailable(Player, "Cloth"));}
function PrisonSubIsHandcuffedOut() {return (PrisonSubSelfCuffed && !PrisonSubBehindBars);}
function PrisonSubIsBehindBars()    {return PrisonSubBehindBars;}
function PrisonSubIsFree()          {return (!PrisonSubBehindBars && !PrisonSubSelfCuffed);}
function PrisonSubAskForCuff()      {return (!PrisonSubAskedCuff);}
function PrisonSubCanStripSearch()  {return  (!PrisonSubIsStripSearch && PrisonSubBehindBars)}
function PrisonSubCanClothBack()    {return  (PrisonSubIsStripSearch && PrisonSubBehindBars)}

/*      Room     */
// Loads the Prison
function PrisonLoad() {
	if (PrisonMaid == null) {
		PrisonMaid = CharacterLoadNPC("NPC_Prison_Maid");
		PrisonMaidCharacter = CommonRandomItemFromList(PrisonMaidCharacter, PrisonMaidCharacterList);
		PrisonMaidAppearance = PrisonMaid.Appearance.slice();
		if (LogQuery("LeadSorority", "Maid") && !PrisonPlayerBehindBars) {
			PrisonMaid.AllowItem = true;
		} else {
			PrisonMaid.AllowItem = false;
		}
	}
	PrisonPlayerAppearance = Player.Appearance.slice();
	PrisonNextEventTimer = new Date().getTime() + (20000 * Math.random()) + (10000);
	
	if ((MaidQuartersCurrentRescue == "Prison") && !MaidQuartersCurrentRescueStarted && !PrisonSubBehindBars && MaidQuartersCurrentRescueCompleted == false) {
		PrisonSub = CharacterLoadNPC("NPC_Prison_Sub");
	}
	if (GamblingIllegalChange == true) {
		GamblingIllegalChange = false;
		CharacterSetCurrent(PrisonMaid);
		PrisonMaid.Stage = "20";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonIllegalChangeIntro");
	}
}

// Run the Prison, draw all characters
function PrisonRun() {
	if (PrisonNextEventTimer == null) PrisonNextEventTimer = new Date().getTime() + (20000 * Math.random()) + (10000);
	if (new Date().getTime() > PrisonNextEventTimer) {
		PrisonNextEventTimer = new Date().getTime() + (20000 * Math.random()) + (10000)
		PrisonNextEvent = true;
	}
	
	if ((MaidQuartersCurrentRescue == "Prison") && MaidQuartersCurrentRescueCompleted == false) {
		//Player is Maid and NPC is Visitor
		if (!PrisonSubBehindBars) {
			DrawImage("Screens/Room/Prison/Cage_open.png", 0, 0);
			if (PrisonSubIsPresent) DrawCharacter(PrisonSub, 500, 0, 1);
		} else {
			//Draw Prisoner smaller
			if (PrisonSubIsPresent) DrawCharacter(PrisonSub, 500, 50, 0.95);
			DrawImage("Screens/Room/Prison/Cage_close.png", 0, 0);
		}
		DrawCharacter(Player, 1000, 0, 1);
		DrawButton(1885, 145, 90, 90, "", "White", "Icons/Character.png");
		if (PrisonSubIsPresent == true) {
			DrawButton(1885, 25, 90, 90, "", "White", "Screens/Room/Prison/eye.png");
		} else if (Player.CanWalk()) {
			DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png");
		}
		if (PrisonNextEvent == true && PrisonSubIsPresent == false) {
			PrisonSub = null;
			CharacterDelete("NPC_Prison_Sub");
			PrisonSub = CharacterLoadNPC("NPC_Prison_Sub");
			PrisonSubAppearance = PrisonSub.Appearance.slice();
			PrisonSubAskedCuff = false;
			PrisonSubIsPresent = true;
			PrisonSubIsLeaveOut = false;
			PrisonNextEvent = false;
		} else if (PrisonNextEvent == true){
			PrisonNextEvent = false;
		}
	} else {
		//Player is Vistor an Maid is NPC 
		if (PrisonPlayerBehindBars) {
			DrawCharacter(Player, 500, 50, 0.95);
			DrawImage("Screens/Room/Prison/Cage_close.png", 0, 0);
		} else {
			DrawImage("Screens/Room/Prison/Cage_open.png", 0, 0);
			DrawCharacter(Player, 500, 0, 1);
		}
		if (PrisonMaidIsPresent) DrawCharacter(PrisonMaid, 1000, 0, 1);
		if (Player.CanWalk() && !PrisonPlayerBehindBars) DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png");
		if (PrisonPlayerBehindBars) DrawButton(1885, 25, 90, 90, "", "White", "Screens/Room/Prison/ButtonBar.png");
		DrawButton(1885, 145, 90, 90, "", "White", "Icons/Character.png");
		// Check if the new maid come
		if (PrisonNextEvent == true && PrisonMaidIsPresent == false ) {
			PrisonMaid = null;
			CharacterDelete("NPC_Prison_Maid");
			PrisonMaid = CharacterLoadNPC("NPC_Prison_Maid");
			PrisonMaidCharacter = CommonRandomItemFromList(PrisonMaidCharacter, PrisonMaidCharacterList);
			PrisonNextEvent = false;
			PrisonMaidIsPresent = true;
			PrisonMaidIsAngry = false;
			PrisonMaid.Stage = "20";
		} else if (PrisonNextEvent == true){
			PrisonNextEvent = false;
		}
	}
}

// When the user clicks in the Cell
function PrisonClick() {
	if ((MaidQuartersCurrentRescue == "Prison") && MaidQuartersCurrentRescueCompleted == false) {
		if ((MouseX >= 1000) && (MouseX < 1500) && (MouseY >= 0) && (MouseY < 1000)) CharacterSetCurrent(Player);
		if ((MouseX >= 500) && (MouseX < 1000) && (MouseY >= 0) && (MouseY < 1000) && PrisonSubIsPresent) CharacterSetCurrent(PrisonSub);
	} else {
		if ((MouseX >= 500) && (MouseX < 1000) && (MouseY >= 0) && (MouseY < 1000)) CharacterSetCurrent(Player);
		if ((MouseX >= 1000) && (MouseX < 1500) && (MouseY >= 0) && (MouseY < 1000) && PrisonMaidIsPresent) CharacterSetCurrent(PrisonMaid);
	}
	if ((MouseX >= 1885) && (MouseX < 1975) && (MouseY >= 25) && (MouseY < 115)) {
		if (MaidQuartersCurrentRescue == "Prison" && MaidQuartersCurrentRescueCompleted == false && PrisonSubIsPresent == true) {
			CharacterSetCurrent(Player);
			Player.CurrentDialog = TextGet("Watch");
		} else if ((Player.CanWalk() && !PrisonPlayerBehindBars)) {
			PrisonLeaveCell();
		} else if (PrisonPlayerBehindBars) {
			CharacterSetCurrent(Player);
			Player.CurrentDialog = TextGet("LockKey");
		} 
	}
	if ((MouseX >= 1885) && (MouseX < 1975) && (MouseY >= 145) && (MouseY < 235)) InformationSheetLoadCharacter(Player);
}

// Returns true if Appearance for Character available
function PrisonCharacterAppearanceAvailable (C, AppearanceName, AppearanceGroup) {
	for (var I = 0; I < C.Appearance.length; I++)
		if ((C.Appearance[I].Asset.Name == AppearanceName) && (C.Appearance[I].Asset.Group.Name == AppearanceGroup))
			return true;
	return false;
}

// Returns true if Appearance-Group for Character available
function PrisonCharacterAppearanceGroupAvailable (C, AppearanceGroup) {
	for (var I = 0; I < C.Appearance.length; I++)
		if (C.Appearance[I].Asset.Group.Name == AppearanceGroup)
			return true;
	return false;
}

/*      Player     */
//Player going in cell
function PrisonCellPlayerIn(){
	PrisonMaidIsAngry = true;
	PrisonPlayerBehindBars = true;
}

//Player leave in cell
function PrisonCellPlayerOut(){
	PrisonPlayerBehindBars = false;
	if (PrisonerMetalCuffsKey != null){
		InventoryAdd(Player, PrisonerMetalCuffsKey.Name, PrisonerMetalCuffsKey.Group);
	}
}

//Maid leave the Prison for 5-15 second
function PrisonMaidLeave(){
	PrisonMaidIsPresent = false;
}

//Player releases and get back his Cloth, only if the Maid is not angry
function PrisonCellRelease(C){
	if (PrisonMaidIsAngry) {
		PrisonMaid.Stage = "20";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidReleaseIsAngry");
	} else {
		PrisonMaid.Stage = "22";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidReleaseIsNotAngry");
		Player.Appearance = PrisonPlayerAppearance;
		CharacterRelease(C);
		PrisonCellPlayerOut();
		CharacterRefresh(C);
	}
}

// The Strip Search Prozess for the Player
function PrisonHavySearch(C){
	if (!PrisonPlayerIsStriped()){
		PrisonMaidIsAngry = true;
		InventoryRemove(C, "Hat"); 
		InventoryRemove(C, "Shoes"); 
		InventoryRemove(C, "Gloves"); 
		InventoryRemove(C, "Cloth"); 
		InventoryRemove(C, "ClothLower"); 
		InventoryWear(C, "MetalCuffs", "ItemArms");
		InventoryWear(C, "LeatherBelt", "ItemLegs");
		InventoryWear(C, "LeatherBelt", "ItemFeet");
		InventoryWear(C, "HarnessPanelGag", "ItemMouth");
		PrisonDisableKey(C);
		PrisonMaid.Stage = "21";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidHavySearch");
		PrisonMaidLeave();
	} else {
		PrisonMaid.Stage = "21";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidHavySearchNot");
		PrisonMaidLeave();
	}
}

// The Light Search Prozess for the Player
function PrisonLightSearch(C){
	if (PrisonerMetalCuffsKey == null) {
		PrisonMaidIsAngry = true;
		InventoryWear(C, "MetalCuffs", "ItemArms");
		if (!C.CanTalk) InventoryWear(Player, "HarnessBallGag", "ItemMouth");
		PrisonDisableKey(C);
		PrisonMaid.Stage = "21";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidLightSearch");
		PrisonMaidLeave();
	} else {
		PrisonMaid.Stage = "21";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidLightSearchNot");
		PrisonMaidLeave();
	}
}

// The Cloth Back Prozess for Prisoner
function PrisonerClothBack(C){
	PrisonMaidIsAngry = true;
	if (PrisonPlayerIsStriped()) {
		for (var A = 0; A < PrisonPlayerAppearance.length; A++) {
			if (PrisonPlayerAppearance[A].Asset.Group.Name == "Hat") {
				InventoryWear(C, PrisonPlayerAppearance[A].Asset.Name, "Hat", PrisonPlayerAppearance[A].Color );
			}
			if (PrisonPlayerAppearance[A].Asset.Group.Name == "Shoes") {
				InventoryWear(C, PrisonPlayerAppearance[A].Asset.Name, "Shoes", PrisonPlayerAppearance[A].Color );
			}
			if (PrisonPlayerAppearance[A].Asset.Group.Name == "Gloves") {
				InventoryWear(C, PrisonPlayerAppearance[A].Asset.Name, "Gloves", PrisonPlayerAppearance[A].Color );
			}
			if (PrisonPlayerAppearance[A].Asset.Group.Name == "Cloth") {
				InventoryWear(C, PrisonPlayerAppearance[A].Asset.Name, "Cloth", PrisonPlayerAppearance[A].Color );
			}
			if (PrisonPlayerAppearance[A].Asset.Group.Name == "ClothLower") {
				InventoryWear(C, PrisonPlayerAppearance[A].Asset.Name, "ClothLower", PrisonPlayerAppearance[A].Color );
			}
		}
		CharacterRefresh(C);
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidClothBack");
	} else {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidClothBackNot");
	}
}

// Remove the Letherbelts from the Prisoner 
function PrisonCuffsRelief(){
	PrisonMaidIsAngry = true;
	if (PrisonPlayerIsPanelGag() || PrisonPlayerIsLegTied() || PrisonPlayerIsFeetTied()) {
		PrisonMaidIsAngry = true;
		CharacterRelease(Player);
		InventoryWear(Player, "MetalCuffs", "ItemArms");
		CharacterRefresh(Player);
		PrisonMaid.Stage = "20";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidCuffsRelief");
	} else {
		PrisonMaid.Stage = "20";
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidCuffsReliefNot");
	}
}

// Light Torture for the Prison Player
function PrisonMaidLightTorture(){
	PrisonMaidIsAngry = true;
	PrisonMaid.Stage = "PrisonerTortured";
	var torture = Math.random() * 4;
	if (torture < 1) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureFondleButt");
	} else if (torture < 2) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureFondleBreast");
	} else if (torture < 3) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureMassage");
	} else if (torture < 4) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureTickle");
	}
}

// Hevy Torture for the Prison Player
function PrisonMaidHevyTorture(){
	PrisonMaidIsAngry = true;
	PrisonMaid.Stage = "PrisonerTortured";
	var torture = Math.random() * 5
	if (torture < 1) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureWhipping");
	} else if (torture < 2) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureSpankButt");
	} else if (torture < 3) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureSpankBreast");
	} else if (torture < 4) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureSlap");
	} else if (torture < 5) {
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidTortureCrop");
	}
}

//get Hadcuffed Key from Prisoner
function PrisonDisableKey(C) {
	for (var I = C.Inventory.length - 1; I > -1; I--)
		if ((C.Inventory[I].Name == "MetalCuffsKey") && (C.Inventory[I].Group == "ItemArms")) {
			PrisonerMetalCuffsKey = C.Inventory[I];
			C.Inventory.splice(I, 1);
		}
}

/*      Player Dialog     */
//Player Ask in Dialog
function PrisonCellPlayerAsk(){
	if (PrisonMaidCharacter == "Chaotic") PrisonMaidChaotic = Math.random();
	if (PrisonMaidCharacter == "Friendly" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.33) ){
		InventoryWear(Player, "ClothOTMGag", "ItemMouth");
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidLightGag");
	} else if (PrisonMaidCharacter == "Neutral" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.66) ){
		InventoryWear(Player, "HarnessBallGag", "ItemMouth");
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidNeutralGag");
	} else {
		InventoryWear(Player, "HarnessPanelGag", "ItemMouth");
		PrisonMaid.CurrentDialog = DialogFind(PrisonMaid, "PrisonMaidHevyGag");
	}
	PrisonMaidIsAngry =true;
	PrisonMaid.Stage = "20";
}

//Player Shake the Cellbars
function PrisonCellPlayerShake(){
	if (PrisonMaidCharacter == "Chaotic") PrisonMaidChaotic = Math.random();
	if (PrisonMaidCharacter == "Friendly" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.33) ){
		PrisonLightSearch(Player);
	} else if (PrisonMaidCharacter == "Neutral" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.66) ){
		PrisonMaidLightTorture();
	} else {
		PrisonHavySearch(Player);
	}
	PrisonMaidIsAngry =true;
}

//Player try to escape
function PrisonCellPlayerTry(){
	if (PrisonMaidCharacter == "Chaotic") PrisonMaidChaotic = Math.random();
	if (PrisonMaidCharacter == "Friendly" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.33) ){
		PrisonCellRelease(Player);
	} else if (PrisonMaidCharacter == "Neutral" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.66) ){
		//ToDo Dialog
		PrisonMaidLightTorture();
	} else {
		PrisonHavySearch(Player);
	}
}

//Player Wimper to Maid
function PrisonCellPlayerWimper(){
	if (PrisonMaidCharacter == "Chaotic") PrisonMaidChaotic = Math.random();
	if (PrisonMaidCharacter == "Friendly" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.33) ){
		PrisonerClothBack(Player);
	} else if (PrisonMaidCharacter == "Neutral" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.66) ){
		PrisonCellRelease(Player);
	} else {
		PrisonMaidHevyTorture();	
	}
}

//Player wait for Maids-Action
function PrisonCellPlayerWait(){
	if (PrisonMaidCharacter == "Chaotic") PrisonMaidChaotic = Math.random();
	if (PrisonMaidCharacter == "Friendly" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.33) ){
		PrisonCuffsRelief();
	} else if (PrisonMaidCharacter == "Neutral" || (PrisonMaidCharacter == "Chaotic" && PrisonMaidChaotic < 0.66) ){
		PrisonLightSearch(Player);
	} else {
		PrisonMaidHevyTorture();
	}
}

/*      NPC     */
// PrisonSub leave the Room
function PrisonSubSendAway(){
	PrisonSubIsPresent = false;
	DialogLeave();
}

//Check if Prison NPC Wear Handcuffes
function PrisonSubHandcuffing(){
	if (Math.random() > 0.5) {
		InventoryWear(PrisonSub, "MetalCuffs", "ItemArms");
		PrisonSubSelfCuffed = true;
		PrisonSub.CurrentDialog = DialogFind(PrisonSub, "PrisonSubInterrest");
	} else {
		PrisonSub.CurrentDialog = DialogFind(PrisonSub, "PrisonSubNoInterrest");
	}
	PrisonSubAskedCuff = true;
}

// Shoves NPC in Cell
function PrisonCellSubIn(){
	PrisonSubBehindBars = true;
	PrisonSub.AllowItem = true;
}

//Strip Search the NPC
function PrisonSubHavySearch(){
	InventoryRemove(PrisonSub, "Hat"); 
	InventoryRemove(PrisonSub, "Shoes"); 
	InventoryRemove(PrisonSub, "Gloves"); 
	InventoryRemove(PrisonSub, "Cloth"); 
	InventoryRemove(PrisonSub, "ClothLower"); 
	InventoryWear(PrisonSub, "MetalCuffs", "ItemArms");
	InventoryWear(PrisonSub, "LeatherBelt", "ItemLegs");
	InventoryWear(PrisonSub, "LeatherBelt", "ItemFeet");
	InventoryWear(PrisonSub, "HarnessPanelGag", "ItemMouth");
	PrisonSubIsStripSearch = true;
}

//Let NPC out of Cell
function PrisonCellSubOut(){
	PrisonSubBehindBars = false;
	PrisonSubIsLeaveOut = true;
	CharacterRelease(PrisonSub);
	PrisonSub.AllowItem = false;
	PrisonSubSelfCuffed = false;
	PrisonSub.Appearance = PrisonSubAppearance;
	CharacterRefresh(PrisonSub);
}

//The Prison NPC Leave the Cell
function PrisonLeaveCell(){
	if (!PrisonSubBehindBars) {
		PrisonSubIsPresent = false;
		PrisonSubSelfCuffed = false;
	}
	if (MaidQuartersCurrentRescue == "Prison") MaidQuartersCurrentRescueCompleted = true;
	CommonSetScreen("Room", "MainHall");
}

//Give Cloth back to Sub
function PrisonSubClothBack() {
	for (var A = 0; A < PrisonSubAppearance.length; A++) {
		if (PrisonSubAppearance[A].Asset.Group.Name == "Hat") {
			InventoryWear(PrisonSub, PrisonSubAppearance[A].Asset.Name, "Hat", PrisonSubAppearance[A].Color );
		}
		if (PrisonSubAppearance[A].Asset.Group.Name == "Shoes") {
			InventoryWear(PrisonSub, PrisonSubAppearance[A].Asset.Name, "Shoes", PrisonSubAppearance[A].Color );
		}
		if (PrisonSubAppearance[A].Asset.Group.Name == "Gloves") {
			InventoryWear(PrisonSub, PrisonSubAppearance[A].Asset.Name, "Gloves", PrisonSubAppearance[A].Color );
		}
		if (PrisonSubAppearance[A].Asset.Group.Name == "Cloth") {
			InventoryWear(PrisonSub, PrisonSubAppearance[A].Asset.Name, "Cloth", PrisonSubAppearance[A].Color );
		}
		if (PrisonSubAppearance[A].Asset.Group.Name == "ClothLower") {
			InventoryWear(PrisonSub, PrisonSubAppearance[A].Asset.Name, "ClothLower", PrisonSubAppearance[A].Color );
		}
	}
	PrisonSubIsStripSearch = false;
	CharacterRefresh(PrisonSub);
}
