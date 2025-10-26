const fs = require('fs');
const githubDb = require('./lib/githubDb');

if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

// Load configuration with GitHub priority
let getGithub = {};
let configLoaded = false;
let userFolder = 'global'; // Default folder

async function loadConfig(botNumber = null) {
    try {
        console.log('[🔄] Loading configuration from Oracle DataBase....');
        
        // Set user folder based on bot number
        if (botNumber && botNumber !== 'unknown' && botNumber !== 'ActiveBot') {
            userFolder = `users/${botNumber}`;
        } else {
            userFolder = 'global';
        }
        
        //[console.log(`[📁] Using folder: ${userFolder}`);
        
        // Try to load from GitHub
        await githubDb.searchAndDownloadFile('configDb.json', JSON.stringify(getDefaultConfig(), null, 2), 'configDb.json', userFolder);
        
        if (fs.existsSync('./configDb.json')) {
            const configData = fs.readFileSync('./configDb.json', 'utf8');
            getGithub = JSON.parse(configData);
            console.log('[✅] Loaded config from Oracle Database');
            configLoaded = true;
        } else {
            console.log('[⚠️] configDb.json not found, using defaults');
        }
    } catch (error) {
        console.log('[❌] Error loading Oracle config');
        // Create default config file locally
        fs.writeFileSync('./configDb.json', JSON.stringify(getDefaultConfig(), null, 2));
        console.log('[📁] Created local configDb.json with defaults');
    }
}

// Set user folder dynamically - YEH FUNCTION ADD KARNA HAI
function setUserFolder(botNumber) {
    if (botNumber && botNumber !== 'unknown' && botNumber !== 'ActiveBot') {
        userFolder = `users/${botNumber}`;
    } else {
        userFolder = 'global';
    }
  //  console.log(`[📁] User folder set to: ${userFolder}`);
}

// Default configuration
function getDefaultConfig() {
    return {
        // ==================== MEDIA SETTINGS ====================
        START_IMG: "https://cdn.inprnt.com/thumbs/5d/0b/5d0b7faa113233d7c2a49cd8dbb80ea5@2x.jpg",
        MENU_IMAGE_URL: "https://cdn.inprnt.com/thumbs/5d/0b/5d0b7faa113233d7c2a49cd8dbb80ea5@2x.jpg",
        ALIVE_IMG: "https://cdn.inprnt.com/thumbs/5d/0b/5d0b7faa113233d7c2a49cd8dbb80ea5@2x.jpg",
        
        // ==================== STATUS SETTINGS ====================
        AUTO_STATUS_SEEN: "true",
        AUTO_STATUS_REPLY: "false",
        AUTO_STATUS_REACT: "true",
        AUTO_STATUS_MSG: "*SEEN YOUR STATUS EDITH-MD*",
        
        // ==================== BOT SETTINGS ====================
        PREFIX: ".",
        BOT_NAME: "EDITH-MD",
        DESCRIPTION: "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Bandaheali*",
        STICKER_NAME: "EDITH-MD",
        LIVE_MSG: "> Zinda Hun Yar *EDITH-MD*⚡",
        
        // ==================== OWNER SETTINGS ====================
        OWNER_NUMBER: "923253617422",
        OWNER_NAME: "Bandaheali",
        DEV: "923253617422",
        
        // ==================== REACTION SETTINGS ====================
        AUTO_REACT: "false",
        CUSTOM_REACT: "false",
        CUSTOM_REACT_EMOJIS: "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
        
        // ==================== MESSAGE SETTINGS ====================
        READ_MESSAGE: "false",
        MENTION_REPLY: "false",
        AUTO_REPLY: "false",
        AUTO_TYPING: "false",
        READ_CMD: "false",
        
        // ==================== GROUP SETTINGS ====================
        WELCOME: "false",
        ADMIN_EVENTS: "false",
        ANTI_DELETE: "true",
        ANTI_DEL_PATH: "inbox",
        
        // ==================== SECURITY SETTINGS ====================
        ANTI_LINK: "true",
        ANTI_MEDIA: "false",
        ANTI_BAD: "false",
        ANTI_VV: "false",
        ANTI_CALL: "false",
        REJECT_MSG: "*_SOORY MY BOSS IS BUSY PLEASE DONT CALL ME_*",
        DELETE_LINKS: "false",
        
        // ==================== AUTO FEATURES ====================
        AUTO_VOICE: "false",
        AUTO_STICKER: "false",
        AUTO_RECORDING: "false",
        
        // ==================== BOT MODE ====================
        MODE: "public",
        BOTMODE: "button",
        PUBLIC_MODE: "true",
        ALWAYS_ONLINE: "false"
    };
}

// Static configuration (for backward compatibility)
const staticConfig = {
    // ==================== BAILEYS & SESSION ====================
    BAILEYS: "@whiskeysockets/baileys",
    SESSION_ID: process.env.SESSION_ID || "BANDAHAELI~uFcUDSDb#ETApDLdYgtU-CPFlyM1fnKGnVpFNOsBqDDc27dYdV78",
    CDN: process.env.CDN || "https://cdn-bandaheali.zone.id",
};

// Function to get config value with GitHub priority
function getConfig(key) {
    if (configLoaded && getGithub[key] !== undefined && getGithub[key] !== null) {
        return getGithub[key];
    }
    
    // Fallback to environment variables
    if (process.env[key] !== undefined) {
        return process.env[key];
    }
    
    // Fallback to static config
    if (staticConfig[key] !== undefined) {
        return staticConfig[key];
    }
    
    // Final fallback to default config
    const defaults = getDefaultConfig();
    return defaults[key];
}

// Function to update config and save to GitHub
async function updateConfig(key, value) {
    try {
        // Update local GitHub config
        getGithub[key] = value;
        
        // Save to GitHub with user folder
        const success = await githubDb.githubClearAndWriteFile('configDb.json', JSON.stringify(getGithub, null, 2), userFolder);
        
        if (success) {
            // Update local file
            fs.writeFileSync('./configDb.json', JSON.stringify(getGithub, null, 2));
        //    console.log(`[✅] Config updated: ${key} = ${value} in folder: ${userFolder}`);
            return true;
        } else {
            console.log(`[❌] Failed to update config on Oracle....`);
            return false;
        }
    } catch (error) {
        console.log(`[❌] Error updating config....`);
        return false;
    }
}

// Function to get all config
function getAllConfig() {
    const allConfig = { ...staticConfig, ...getDefaultConfig(), ...getGithub };
    
    // Override with environment variables
    Object.keys(process.env).forEach(key => {
        if (allConfig.hasOwnProperty(key)) {
            allConfig[key] = process.env[key];
        }
    });
    
    return allConfig;
}

// Get current user folder
function getUserFolder() {
    return userFolder;
}

// Initialize the config module
const configModule = {
    get: getConfig,
    set: updateConfig,
    getAll: getAllConfig,
    init: loadConfig,
    setUserFolder: setUserFolder,  // ✅ YEH LINE IMPORTANT HAI
    getUserFolder: getUserFolder,  // ✅ YEH BHI
    isGitHubLoaded: () => configLoaded
};

// Add individual properties for backward compatibility
Object.keys(getDefaultConfig()).forEach(key => {
    Object.defineProperty(configModule, key, {
        get: function() { return this.get(key); }
    });
});

Object.keys(staticConfig).forEach(key => {
    Object.defineProperty(configModule, key, {
        get: function() { return staticConfig[key]; }
    });
});

module.exports = configModule;
