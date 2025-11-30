// src/lib/industries/mobile/device-support.ts

/**
 * Mobile operators module - Device troubleshooting and support
 */

export interface DeviceInfo {
    manufacturer?: string;
    model?: string;
    os?: string;
    osVersion?: string;
}

/**
 * Get PUK code
 */
export async function getPUKCode(
    phoneNumber: string,
    operator: 'airtel' | 'mtn' | 'zamtel',
    nationalIdNumber: string
): Promise<{ success: boolean; message: string; pukCode?: string }> {
    // TODO: Integrate with operator security system
    // This should verify ID and only provide PUK to account owner

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, verify identity first
    const pukCode = '12345678'; // Mock - actual would come from operator

    return {
        success: true,
        message: `Your PUK code has been sent to your registered email.\n\n⚠️ IMPORTANT:\n• PUK Code: ${pukCode}\n• DO NOT share this code\n• Used to unlock SIM after 3 wrong PIN attempts\n• After 10 wrong PUK attempts, SIM is permanently blocked\n• Store this code safely\n\nHow to use PUK:\n1. Enter PUK when prompted\n2. Create new 4-digit PIN\n3. Confirm new PIN\n4. SIM unlocked`,
        pukCode,
    };
}

/**
 * Device troubleshooting for common issues
 */
export function getDeviceTroubleshooting(
    issue: 'phone_not_charging' | 'slow_performance' | 'overheating' | 'battery_drain' | 'storage_full' | 'app_crashes'
): string {
    const guides = {
        phone_not_charging: `🔋 Phone Not Charging - Solutions:

1. Check Charging Cable
   • Try different USB cable
   • Look for damage/fraying
   • Use original cable if possible

2. Check Power Source
   • Try different wall socket
   • Try USB port on computer
   • Ensure power source working

3. Clean Charging Port
   • Turn off phone
   • Gently clean port with toothpick
   • Remove dust/lint carefully
   • DO NOT use metal objects

4. Check Charging Adapter
   • Try different charger
   • Check adapter for damage
   • Ensure correct wattage

5. Try Wireless Charging
   • If phone supports it
   • May indicate port issue

6. Restart Phone
   • Soft reset can help
   • Hold power button

7. Battery Calibration
   • Let battery drain to 0%
   • Charge to 100% uninterrupted
   • Use phone normally

If still not working, battery may need replacement.`,

        slow_performance: `🐌 Slow Phone Performance - Speed Up:

1. Restart Phone
   • Clears temporary memory
   • Closes background apps
   • Hold power button > Restart

2. Clear App Cache
   • Settings > Apps
   • Select app > Clear Cache
   • Do for frequently used apps

3. Free Up Storage
   • Settings > Storage
   • Delete unused apps
   • Move photos to cloud/SD card
   • Clear downloads folder

4. Update Software
   • Settings > System Update
   • Install latest updates
   • Updates improve performance

5. Disable Animations
   • Developer options
   • Reduce animation scale
   • Makes UI feel faster

6. Remove Widgets & Live Wallpapers
   • Use static wallpaper
   • Remove unused widgets
   • Reduces RAM usage

7. Uninstall Unused Apps
   • Remove apps not used in 3 months
   • Fewer apps = faster phone

8. Factory Reset (Last Resort)
   • Backup data first!
   • Settings > Reset > Factory Reset
   • Fresh start`,

        overheating: `🔥 Phone Overheating - Solutions:

1. Immediate Actions
   • Stop using phone
   • Remove case
   • Turn off if very hot
   • Move to cool area
   • DO NOT put in fridge!

2. Close Background Apps
   • Swipe up to see all apps
   • Close all unused apps
   • Reduces processor load

3. Disable Unused Features
   • Turn off Bluetooth
   • Disable GPS/Location
   • Turn off WiFi if not needed
   • Reduce screen brightness

4. Avoid Direct Sunlight
   • Keep phone out of sun
   • Don't leave in hot car
   • Use shade

5. Remove Phone Case
   • While charging
   • During heavy use
   • Better heat dissipation

6. Stop Heavy Tasks
   • Close games
   • Pause video recording
   • Stop video streaming

7. Update Apps & OS
   • Buggy apps cause heating
   • Check for updates

When to Worry:
❌ Too hot to touch
❌ Battery swelling
❌ Screen issues
❌ Frequent overheating

Visit service center if persistent.`,

        battery_drain: `🔋 Fast Battery Drain - Fix:

1. Check Battery Usage
   • Settings > Battery
   • See which apps drain most
   • Uninstall battery hogs

2. Reduce Screen Brightness
   • Use auto-brightness
   • Lower manual brightness
   • Turn off adaptive brightness

3. Turn Off Location Services
   • Settings > Location > Off
   • Or restrict per app
   • Biggest battery drain

4. Disable Background Data
   • Settings > Data Usage
   • Restrict background data for apps
   • Saves battery & data

5. Turn Off Auto-Sync
   • Settings > Accounts
   • Disable auto-sync
   • Sync manually when needed

6. Use Battery Saver Mode
   • Settings > Battery > Saver
   • Limits background activity
   • Reduces performance slightly

7. Reduce Screen Timeout
   • Settings > Display > Sleep
   • Set to 30 seconds
   • Screen uses most power

8. Disable Vibrations
   • Use ringtone only
   • Vibration uses battery

9. Update Apps
   • Buggy apps drain battery
   • Keep all apps updated

10. Check Battery Health
    • Settings may show battery health
    • Replace if below 80%

Battery Tips:
✅ Charge 20-80% (not 0-100%)
✅ Avoid overnight charging
✅ Use original charger`,

        storage_full: `💾 Storage Full - Free Up Space:

1. Check Storage Usage
   • Settings > Storage
   • See what's using space
   • Target largest items

2. Delete Photos & Videos
   • Upload to Google Photos
   • Delete after backup
   • Photos take most space

3. Clear App Cache
   • Settings > Apps > Clear Cache
   • Do for all large apps
   • Especially social media

4. Delete Downloads
   • Files > Downloads folder
   • Delete old PDFs, images
   • Often forgotten files

5. Uninstall Unused Apps
   • Hold app icon > Uninstall
   • Remove games not played
   • Can reinstall anytime

6. Use Lite Versions
   • Facebook Lite instead of Facebook
   • Messenger Lite
   • Smaller app size

7. Move Files to SD Card
   • If phone has SD slot
   • Settings > Storage > SD Card
   • Move photos, videos, music

8. Clear WhatsApp Media
   • Biggest space user!
   • Delete old videos
   • Go to: WhatsApp > Settings > Storage

9. Delete Offline Content
   • Downloaded music (Spotify)
   • Downloaded videos (Netflix)
   • Downloaded maps

10. Use Cloud Storage
    • Google Drive
    • Dropbox
    • OneDrive

Free space target: At least 1GB free`,

        app_crashes: `💥 Apps Keep Crashing - Fixes:

1. Restart App
   • Close app completely
   • Clear from recent apps
   • Open again

2. Clear App Cache & Data
   • Settings > Apps
   • Select crashing app
   • Clear Cache first
   • Then Clear Data (loses settings)

3. Update App
   • Open Play Store
   • Search for app
   • Update if available
   • Bug fixes often included

4. Restart Phone
   • Fixes many issues
   • Clears memory
   • Hold power button

5. Check Storage Space
   • Need at least 1GB free
   • Apps crash when storage full
   • Delete files to free space

6. Update Android OS
   • Settings > System Update
   • Install latest version
   • Improves compatibility

7. Uninstall & Reinstall App
   • Last resort for that app
   • Completely removes app
   • Fresh install may fix

8. Check Internet Connection
   • Some apps need internet
   • Switch WiFi/Mobile Data
   • Test connection

9. Check App Permissions
   • Settings > Apps > Permissions
   • Ensure required permissions granted
   • Some apps crash without them

10. Report to Developer
    • Play Store > App > Report
    • Describe crash
    • Helps fix bugs

If ALL apps crash: Factory reset may be needed`,
    };

    return guides[issue];
}

/**
 * Get device setup assistance
 */
export function getDeviceSetup(
    task: 'apn_settings' | 'mobile_data' | 'hotspot' | 'mms_settings'
): string {
    const guides = {
        apn_settings: `📱 APN Settings Configuration:

What is APN?
Access Point Name - allows your phone to connect to mobile internet

How to Configure:

1. Go to Settings
2. Mobile Networks or Connections
3. Access Point Names (APN)
4. Add new APN (+) or Edit existing

5. Enter these details:

AIRTEL:
• Name: Airtel Internet
• APN: internet
• Proxy: Not set
• Port: Not set
• Username: Not set
• Password: Not set
• Server: Not set
• MMSC: http://mms.africa.airtel.com/mms
• MMS Proxy: 10.199.212.2
• MMS Port: 8080
• MCC: 645
• MNC: 01
• APN Type: default,mms,supl
• APN Protocol: IPv4

MTN:
• Name: MTN Internet
• APN: internet
• (Other settings same as above)
• MMSC: http://mms.mtn.co.zm/mms
• MCC: 645
• MNC: 02

ZAMTEL:
• Name: Zamtel Internet
• APN: internet
• MMSC: http://mms.zamtel.zm/mms
• MCC: 645
• MNC: 03

6. Save
7. Select new APN
8. Restart phone

Not working? Reply 'troubleshoot data'`,

        mobile_data: `📶 Enable Mobile Data:

Android:
1. Swipe down from top (twice)
2. Tap Mobile Data icon
3. Or: Settings > Network > Mobile Data: ON

iPhone:
1. Settings
2. Mobile Data or Cellular
3. Toggle ON

Additional Settings:

Data Roaming:
• Only enable abroad
• Settings > Mobile Networks > Roaming: ON
• Extra charges may apply

Data Limit:
• Set warning at 80% of bundle
• Settings > Data Usage
• Set limit to avoid charges

Background Data:
• Restrict for specific apps
• Saves data
• Settings > Apps > Restrict Background

4G/5G Settings:
• Settings > Mobile Networks
• Preferred Network: 4G/LTE
• Faster speeds but more battery use

If no data: Check APN settings`,

        hotspot: `📡 Setup Mobile Hotspot:

Android:
1. Settings > Network
2. Hotspot & Tethering
3. WiFi Hotspot > Toggle ON
4. Configure:
   • Network Name: Choose name
   • Password: Min 8 characters
   • Security: WPA2
   • Band: 2.4GHz (better range)

5. Show password
6. Connect devices

iPhone:
1. Settings
2. Personal Hotspot
3. Toggle ON
4. Set WiFi Password
5. Connect devices

Important Tips:

Battery:
• Keep phone plugged in
• Hotspot drains battery fast

Data Usage:
• Monitor closely
• Can use data quickly
• Set data limit warnings

Max Connections:
• Usually 5-10 devices
• More devices = slower speeds

Speed:
• Depends on network signal
• 4G faster than 3G
• Check signal strength

Turn Off When Not Using:
• Saves battery
• Protects data
• Better security

Troubleshooting:
• Devices can't connect?
• Check password
• Ensure hotspot ON
• Restart phone`,

        mms_settings: `📨 MMS (Picture Messages) Settings:

Enable MMS:

1. Settings > Apps
2. Messages app
3. Settings > Advanced
4. Auto-retrieve MMS: ON
5. Mobile data: ON (required for MMS)

Configure APN for MMS:
• Settings > Mobile Networks > APN
• Ensure MMSC is set (see APN guide)
• MMS Proxy & Port configured

Send Picture Message:

1. Open Messages app
2. New message
3. Tap attachment (paperclip/+)
4. Select photo/video
5. Add text (optional)
6. Send

Receive Picture Message:
• Auto-downloads if mobile data ON
• Or tap to download

Troubleshooting:

Can't Send MMS:
✓ Mobile data must be ON
✓ Check APN settings (MMSC required)
✓ Ensure sufficient airtime/bundle
✓ Check file size (max 300KB-1MB)

Can't Receive:
✓ Enable auto-retrieve
✓ Sufficient storage space
✓ Mobile data ON

File Size:
• Large photos auto-compressed
• Videos limited to 30 seconds
• Use WhatsApp for large files

Costs:
• Check with operator
• May require bundle/airtime
• Some bundles include MMS`,
    };

    return guides[task];
}
