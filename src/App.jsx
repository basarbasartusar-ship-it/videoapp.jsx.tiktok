import { useState } from "react"

export default function App() {
  return (
    <div>
      <h1>VideoApp</h1>
    </div>
  )
}

1. AVATARS array: ["🐯","🦊","🐺","🦁","🐻","🐼","🐨","🦅","🐉","🌟","⚡","🔥","🌊","🌸","🍀","🎭","💎","🎸","🚀","🎯"]
2. MUSIC_LIST array: ["Original Sound","Lo-fi Chill","Trending Pop","Bollywood Hits","EDM Remix","Acoustic Vibes","Hip Hop Beat","Classical","Desi Trap","Romantic"]
3. VID_EMOJIS array: ["🎵","🎬","🌟","🔥","💫","🎭","🌊","⚡","🎮","🌺","😎","🤩"]
4. fmt(ts) function: returns "এখনই" if <60s, "Xm আগে" if <1h, "Xh আগে" if <24h, else "Xd আগে"
5. fmtNum(n) function: returns "0" if falsy, "X.XM" if >=1M, "X.XK" if >=1K, else String(n)
6. Storage helpers using window.storage API:
   - async sget(key, shared=false): get + JSON.parse, return null on error
   - async sset(key, val, shared=false): JSON.stringify + set, return true/false
   - async slist(prefix, shared=false): list keys, return array
   - async sdel(key, shared=false): delete key, return true/false

Render a placeholder: <div style={{color:"#fff",background:"#000",height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center"}}>VibeReel Loading...</div>Add SVG icon components to the existing VibeReel artifact. Add a const IC object with these SVG icon components (all returning JSX):

IC.Home: ({a}) => house icon, fill white if a else none, stroke white if a else #888
IC.Search: ({a}) => circle+line magnifier, stroke white if a else #888
IC.Plus: () => plus sign, stroke #fff, strokeWidth 2.5
IC.Bell: ({a,n}) => bell with optional red badge showing count n, stroke white if a else #888
IC.User: ({a}) => person silhouette, stroke white if a else #888
IC.Heart: ({f,size=28}) => heart, fill+stroke #FE2C55 if f else none/white
IC.Comment: ({size=26}) => speech bubble, stroke #fff
IC.Share: ({size=26}) => upload arrow, stroke #fff
IC.Bookmark: ({f,size=24}) => bookmark, fill+stroke #25F4EE if f else none/white
IC.Back: () => left chevron, stroke #fff, strokeWidth 2.5
IC.Close: () => X cross, stroke #fff, strokeWidth 2.5
IC.Send: () => paper plane polygon, fill #fff
IC.Edit: () => pencil/edit icon, stroke #fff
IC.Trash: () => trash can, stroke #FE2C55
IC.Music: () => music note, fill #fff, width/height 13
IC.Upload: () => cloud upload, stroke #fff, width/height 32
IC.Camera: () => camera, stroke #888
IC.Settings: () => gear/cog, stroke #888
IC.Hash: () => hashtag lines, stroke #888, width/height 14
IC.Check: ({color="#25F4EE"}) => checkmark polyline
IC.Eye: ({off}) => eye open or eye-slash based on off prop, stroke #888
IC.Grid: () => 4-square grid, stroke #888
IC.Crown: () => star/crown shape, fill #FFD700
IC.Shield: () => shield, fill #FE2C55
IC.Ban: () => circle with diagonal line, stroke #FE2C55
IC.Stats: () => bar chart lines, stroke #888
IC.Users: () => two people, stroke #888
IC.Video: () => video camera, stroke #888
IC.Flag: () => flag, stroke #888
IC.Msg: () => chat bubble, stroke #888
IC.ChevRight: () => right chevron, stroke #555

Keep the placeholder render unchanged.Add Toast notification system to the VibeReel artifact:

1. Toast component: function Toast({ msg, type = "info" })
   - Fixed position, top: 60, centered horizontally (left 50%, translateX -50%)
   - zIndex 9999
   - Background: #0a2a1a for success, #2a0a0a for error, #0a0a2a for info
   - Border: #25F4EE for success, #FE2C55 for error, #333 for info
   - borderRadius 12, padding "10px 18px", white text, fontSize 14, fontWeight 600
   - boxShadow "0 4px 24px rgba(0,0,0,0.7)"

2. useToast hook: returns [toast, show]
   - Uses useState for toast state
   - show(msg, type="info") sets toast and clears it after 2500ms using setTimeout
   - Uses useCallback

Keep placeholder render unchanged.Add the AuthScreen component to the VibeReel artifact.

State: mode ("splash"|"login"|"signup"), uname, pass, dname, avatar (default AVATARS[0]), bio, err, busy, showPass

Inner Field component: label, val, set, type="text", note props. Renders a styled dark input (#0d0d0d bg, #1e1e1e border, borderRadius 12). For password type shows eye toggle button using IC.Eye.

splash mode: full black screen, centered, red glow div behind 🎬 emoji (fontSize 80), "VibeReel" h1 (fontSize 36, fontWeight 900), subtitle text, two buttons:
- "✨ নতুন অ্যাকাউন্ট তৈরি করুন" → gradient #FE2C55 to #ff4d6d
- "লগইন করুন" → transparent with #222 border

login mode: back button, "স্বাগতম 👋" heading, username + password fields, error text, login button (gradient red), link to signup

signup mode: back button, avatar picker grid (AVATARS mapped to 46x46 buttons, selected has #FE2C55 border), display name + username + password fields, bio textarea, error, submit button

login async function: validates fields, calls sget("user:"+username, true), checks banned, checks password match, calls sset("session", {uid, username}, false), calls onLogin(user)

signup async function: validates, sanitizes username (a-z0-9_. only, min 3), min 4 char password, checks existing user, creates uid, checks if first user (makes admin), saves user to shared storage, saves session, calls onLogin

Update render: show AuthScreen if no user, else keep placeholder.Add the CommentPanel component to the VibeReel artifact.

Props: video, currentUser, onClose, onCount

State: comments [], text "", loading true, sending false
Refs: endRef

load function (useCallback on video.id):
- slist("cmt:"+video.id+":", true) to get keys
- fetch all, filter null, sort by createdAt ascending
- setComments, setLoading(false)

useEffect: call load() on mount
useEffect: scroll endRef into view when comments change (behavior: smooth)

send async function:
- if text empty return
- setSending(true)
- create comment object: id = "cmt:"+video.id+":"+Date.now()+"_"+random, videoId, uid, username, displayName, avatar, text, createdAt: Date.now()
- sset(c.id, c, true)
- update video.comments count in storage
- if video.uid !== currentUser.uid: create notification in "notif:"+video.uid+":"+timestamp+"_c" (type: "comment")
- clear text, reload, setSending(false)

UI: fixed overlay (inset 0, zIndex 300, flex column justify flex-end), clicking backdrop calls onClose
Panel: #0d0d0d bg, borderRadius "20px 20px 0 0", height 72dvh
Header: "💬 কমেন্ট (N)" + close button
Body: scrollable list of comments (avatar circle 36px, displayName bold, "creator" badge if commenter is video owner, timestamp, text)
Footer: current user avatar + input + send button (red when text present)

Keep existing render logic, just add this component definition.Add ShareModal component to the VibeReel artifact.

Props: video, onClose

State: copied (bool)

link = "https://vibereel.app/v/"+video.id
copy function: navigator.clipboard.writeText(link), setCopied(true), reset after 2000ms

apps array: 
[{e:"💬",n:"WhatsApp"}, {e:"📘",n:"Facebook"}, {e:"📸",n:"Instagram"}, {e:"🐦",n:"Twitter/X"}, {e:"✈️",n:"Telegram"}, {e:"🔗",n: copied?"কপি হয়েছে ✓":"লিংক কপি", a:copy}]

UI: fixed overlay (inset 0, rgba(0,0,0,0.7) bg, zIndex 400, alignItems flex-end)
Sheet: full width, #0d0d0d bg, borderRadius "20px 20px 0 0", padding "16px 18px 40px"
- Drag handle: 36x4px, #2a2a2a, margin auto, margin-bottom 16
- Title "↗️ শেয়ার করুন"
- Grid 3 columns of app buttons: each flex-column, emoji (fontSize 26) + name (color #999, fontSize 11)

Keep existing render logic unchanged.Add the VideoCard component to the VibeReel artifact.

Props: video, currentUser, liked, bookmarked, likeCount, following, onLike, onBookmark, onFollow, onOpenProfile

State: showComments, showShare, cmtCount (init video.comments||0), musicAnim (0-360), playing (true), heartAnim (false)
Ref: vidRef

useEffect: setInterval every 60ms incrementing musicAnim by 2 (mod 360), cleanup on unmount

isOwn = video.uid === currentUser.uid

handleDoubleTap: if not liked call onLike(video.id), setHeartAnim(true), clear after 800ms
togglePlay: pause/play vidRef.current, toggle playing state

Main div: position relative, width 100%, height 100dvh, flexShrink 0, overflow hidden, background #000, scrollSnapAlign start, scrollSnapStop always

Background layer: if video.videoData → <video> with autoPlay loop muted playsInline onClick={togglePlay}; else dark radial gradient div with 🎬 emoji, onDoubleClick={handleDoubleTap}

Pause indicator: shown when videoData && !playing — centered semi-transparent circle with ▶ symbol, zIndex 5, pointerEvents none

Heart animation: when heartAnim — centered ❤️ fontSize 80, zIndex 10, CSS animation "heartPop 0.8s ease-out forwards"

Two gradient overlays: bottom-to-top dark, top-to-bottom slight dark

Right action bar (position absolute, right 10, bottom 108, zIndex 20, flex column gap 22):
1. Avatar button (50x50 circle, 2.5px white border) → onOpenProfile(video); if !isOwn show +/✓ follow toggle below
2. Like button → IC.Heart, count below, scale animation when liked
3. Comment button → IC.Comment, cmtCount below → setShowComments(true)
4. Bookmark button → IC.Bookmark, "সেভ" label
5. Share button → IC.Share, shares count → setShowShare(true)
6. Music disc (44x44 rotating circle, shows video.avatar emoji)

Bottom info (position absolute, bottom 90, left 14, right 76, zIndex 20):
- @username (fontWeight 800) + verified checkmark, clickable → onOpenProfile
- caption text
- hashtags in #25F4EE
- music pill with IC.Music icon

Conditionally render CommentPanel and ShareModal

Add CSS keyframes: @keyframes heartPop {0% scale(0) opacity 0; 50% scale(1.3) opacity 1; 100% scale(1.5) opacity 0}Add the HomeTab component to the VibeReel artifact.

Props: currentUser, following, bookmarks, onFollow, onBookmark, onLike, liked, likeCounts, onOpenProfile, refresh

State: feedTab ("foryou"|"following"), videos [], loading true
Ref: containerRef

load function (useCallback): 
- setLoading(true)
- slist("video:", true) → fetch all → filter null → sort by createdAt descending
- setVideos(all), setLoading(false)

useEffect: call load() when load or refresh changes

feed = feedTab==="foryou" ? videos : videos.filter(v => v.uid !== currentUser.uid && following[v.uid])

UI: full width, height 100dvh, background #000, position relative

Tab bar (position absolute, top 0, zIndex 50):
- Gradient overlay: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)
- Two tabs: "For You" and "ফলোয়িং"
- Active tab: white, fontWeight 800, 2.5px white bottom border
- Inactive: rgba(255,255,255,0.45)

Scroll container (ref=containerRef):
- width 100%, height 100dvh, overflowY scroll, scrollSnapType "y mandatory", scrollbarWidth none

Loading state: centered 🎬 emoji with red glow + "ভিডিও লোড হচ্ছে..."

Empty state: centered 📭 + message based on feedTab

Video list: feed.map(v => <VideoCard ...>) passing all required propsAdd the UploadScreen component to the VibeReel artifact.

Props: currentUser, onClose, onUploaded, editVideo (optional)

State: 
- caption (init editVideo?.caption||"")
- hashtags (init editVideo hashtags joined with spaces and # prefix)
- music (init editVideo?.music||MUSIC_LIST[0])
- emoji (init editVideo?.emoji||VID_EMOJIS[0])
- videoFile, thumbFile (null)
- preview (init editVideo?.videoData||null)
- thumbPreview (init editVideo?.thumbnail||null)
- busy, step ("pick" if no editVideo else "details")
- toast via useToast()

Refs: fileRef, thumbRef

handleVid: validate video/* type, max 50MB, set file + preview URL, setStep("details")
handleThumb: validate image/* type, set file + preview URL
parseTags(str): extract #hashtags from string using regex /#[\w\u0980-\u09FF]+/g, return lowercase array without #

submit async:
- validate caption not empty
- setBusy(true)
- read thumbFile as base64 DataURL if present
- if editVideo: fetch video from storage, update caption/hashtags/music/emoji/thumbnail/editedAt, sset back, show success toast
- if new: create video object with id="video:"+timestamp+"_"+random, all user fields, caption/emoji/music/hashtags, likes/comments/shares:0, createdAt
- if videoFile: read as base64 DataURL, set vid.videoData
- sset(vid.id, vid, true)
- notify followers: sget("followers:"+currentUser.uid, true) → for each follower uid → create "notif:"+fuid+":"+timestamp+"_v" notification (type: "new_video")
- show success toast, setTimeout 800ms → onUploaded() + onClose()
- on error: show error toast, setBusy(false)

UI: fixed fullscreen, #000 bg, zIndex 200, flex column, overflowY auto

Header: close button (IC.Close), title ("ভিডিও এডিট করুন" or "নতুন ভিডিও পোস্ট"), spacer div

step="pick": centered layout with:
- Dashed circle (IC.Upload icon) clicking → fileRef.current.click()
- "গ্যালারি থেকে ভিডিও বেছে নিন" heading + "MP4, MOV সাপোর্টেড · সর্বোচ্চ ৫০MB" subtitle
- Red gradient "📁 ফাইল বেছে নিন" button
- Hidden file input (accept video/*)
- Text button "বা শুধু ইমোজি পোস্ট করুন →" → setStep("details")

step="details": scrollable form with:
- Video preview (9:16 aspect ratio, maxHeight 280, video element if preview, else emoji centered)
- "📁 ভিডিও যোগ করুন" overlay button if no preview
- Hidden video file input
- Thumbnail section: optional image picker, show preview img if selected
- Caption textarea (required, 3 rows)
- Hashtags input (placeholder "#মজা #ভাইব #gaming")
- Music horizontal scroll: MUSIC_LIST buttons, selected = #FE2C55
- Emoji picker grid (only shown if no preview): VID_EMOJIS buttons, selected has #FE2C55 border
- Submit button: red gradient, shows loading text when busy

Show toast overlay at top.Add VideoThumb and UserRow helper components to the VibeReel artifact.

VideoThumb({ v }):
- div: aspectRatio "9/16", background #0a0a0a, borderRadius 4, overflow hidden, position relative
- Show: thumbnail img if v.thumbnail, else video element if v.videoData, else emoji div (v.emoji||"🎬" at fontSize 28)
- Overlay at bottom: linear-gradient(transparent, rgba(0,0,0,0.85)), padding "18px 6px 5px"
  - "@"+v.username in white, fontSize 10, fontWeight 600, overflow ellipsis
  - ❤️ icon (color #FE2C55, fontSize 9) + like count (color #aaa, fontSize 9)

UserRow({ u, currentUser, following, onFollow }):
- div: flex, alignItems center, gap 12, padding "12px 0", borderBottom "1px solid #0d0d0d"
- Avatar circle (50x50, background #1a1a1a, border 1.5px solid #2a2a2a, fontSize 24): u.avatar||"👤"
- Info div (flex 1, minWidth 0):
  - displayName (fontWeight 700, fontSize 14) + verified ✔️ + admin 🛡 badges
  - @username (color #555, fontSize 12)
  - bio if present (color #444, fontSize 11, overflow ellipsis)
- If u.uid !== currentUser.uid: Follow/Unfollow button
  - background #FE2C55 if not following, #1a1a1a if following
  - text "ফলো করুন" or "আনফলো করুন"
  - calls onFollow(u.uid, u.username)Add the SearchTab component to the VibeReel artifact.

Props: currentUser, following, onFollow

State: q (""), mode ("all"|"users"|"videos"|"tags"), users [], videos [], loading false, trending []

useEffect on mount:
- load all users (slist "user:", filter banned:false)
- load all videos (slist "video:", sort by createdAt desc)
- compute trending hashtags: count each hashtag across all videos, sort by count descending, take top 12

Filtered results:
- lq = q.trim().toLowerCase(), strip leading #
- fUsers: filter by username or displayName containing lq
- fVids: filter by username, caption, or hashtags containing lq
- fAll = {users: slice(0,5), videos: slice(0,9 or 12)}

UI layout: background #000, minHeight 100%, paddingBottom 100

Sticky search header (top 0, zIndex 10):
- Search input row: #0d0d0d bg, borderRadius 14, IC.Search icon + input + × clear button
- Mode filter tabs (shown only when q has value): "전체 all", "👤 ইউজার", "🎬 ভিডিও", "# ট্যাগ"
  - Selected tab: #FE2C55 bg, others #1a1a1a

No query state (explore):
- "🔥 ট্রেন্ডিং হ্যাশট্যাগ" section: flex wrap of hashtag buttons with IC.Hash + count, clicking sets q
- "✨ সম্প্রতি যোগ দিয়েছেন" section: first 5 users as UserRow
- "🎬 সাম্প্রতিক ভিডিও": 3-column grid of VideoThumb

Query state:
- Show users section (mode all or users): list of UserRow
- Show videos section (mode all or videos or tags): 3-column VideoThumb grid
- If nothing found: 😕 + "কোনো ফলাফল নেই"Add the NotifTab component to the VibeReel artifact.

Props: currentUser, onClear

State: notifs [], loading true

useEffect on mount (depends on currentUser.uid, onClear):
- slist("notif:"+currentUser.uid+":", true) to get all notification keys
- fetch all, filter null, sort by createdAt descending
- setNotifs(all)
- Mark all as read: for each key, if n.read is false, set n.read=true and sset back
- call onClear()
- setLoading(false)

Icons map: {new_video:"🎬", comment:"💬", like:"❤️", follow:"👤", mention:"@"}
Labels map: 
- new_video: "নতুন ভিডিও পোস্ট করেছে"
- comment: "আপনার ভিডিওতে কমেন্ট করেছে"
- like: "আপনার ভিডিও লাইক করেছে"
- follow: "আপনাকে ফলো করেছে"
- mention: "আপনাকে মেনশন করেছে"

UI: background #000, minHeight 100%, paddingBottom 100

Sticky header: "🔔 নোটিফিকেশন" (fontWeight 800, fontSize 20)

Loading: centered 🔔 + "লোড হচ্ছে..."

Empty: centered 🔕 + "কোনো নোটিফিকেশন নেই" + hint text

Notification list: for each notification:
- flex row, gap 12, padding "14px 16px", borderBottom "1px solid #0a0a0a"
- Unread: rgba(254,44,85,0.04) background
- Avatar circle (48x48, #1a1a1a, fontSize 22): n.fromAvatar||"👤"
- Content div:
  - fromDisplayName (fontWeight 700) + @fromUsername (color #666) + label text + emoji icon
  - if n.text: italic quoted text in color #555
  - if n.caption: truncated caption in color #555
  - timestamp (fmt(n.createdAt)) in color #333
- If unread: small red dot (8x8, #FE2C55) on the rightAdd the ProfilePage component to the VibeReel artifact.

Props: targetUser, currentUser, following, onFollow, onBack, onEdit, onLogout

State: videos [], savedVids [], tab ("videos"|"saved"), followerCount 0, followingCount 0, editing (null), toast, confirmDel (null)

isOwn = targetUser.uid === currentUser.uid
isFollowing = !!following[targetUser.uid]

load function (useCallback on targetUser.uid, currentUser.uid, isOwn):
- fetch all videos, filter by targetUser.uid, sort descending → setVideos
- sget("followers:"+targetUser.uid, true) → count keys → setFollowerCount
- sget("following:"+targetUser.uid, false) → count keys → setFollowingCount
- if isOwn: sget("bookmarks:"+currentUser.uid, false) → fetch each video → setSavedVids

deleteVideo: sdel(vid.id, true), show success toast, setConfirmDel(null), reload

totalLikes = videos.reduce sum of likes

UI: background #000, minHeight 100dvh, paddingBottom 100

Show Toast, editing UploadScreen, and confirmDel modal (delete confirmation with cancel/delete buttons)

Sticky header (top 0, zIndex 10):
- Back button (if onBack), title ("আমার প্রোফাইল" or "@username"), settings button if isOwn

Cover gradient (height 80): linear-gradient(135deg, rgba(254,44,85,0.25), rgba(37,244,238,0.1)) with blur

Profile info section (marginTop -38):
- Avatar (80x80, border 3px solid #000) + display name + verified badge + admin badge
- @username below
- bio if present
- Stats row (4 columns in dark rounded box): ভিডিও, ফলোয়ার, ফলোয়িং, লাইক
- Action buttons:
  - if not isOwn: Follow/Following button (gradient red or #1a1a1a) + "📨 মেসেজ" button
  - if isOwn: "✏️ প্রোফাইল এডিট" + "লগআউট" (red text)

Sticky tab bar (top 56, zIndex 9): "🎬 ভিডিও" + (isOwn) "🔖 সেভ" tabs
Active tab: #FE2C55 bottom border

3-column video grid (gap 2, padding 2):
- Each cell: 9/16 aspect ratio, show thumbnail/video/emoji
- Bottom overlay with like count
- If isOwn on videos tab: Edit (IC.Edit) and Delete (IC.Trash) buttons per videoAdd the EditProfileScreen component to the VibeReel artifact.

Props: currentUser, onSave, onClose

State: dname (currentUser.displayName), uname (currentUser.username), bio (currentUser.bio||""), avatar (currentUser.avatar||AVATARS[0]), newPass (""), currPass (""), err (""), busy (false), toast

save async function:
- validate dname not empty
- sanitize username to a-z0-9_. only, min 3 chars
- if newPass: min 4 chars, currPass must match currentUser.password
- setBusy(true)
- if username changed: check if new username already exists in storage, delete old key
- create updated user object spread from currentUser with new values
- if newPass: update password
- sset("user:"+newUname, updated, true)
- sset("session", {uid, username: newUname}, false)
- show "প্রোফাইল আপডেট হয়েছে ✓" success toast
- setTimeout 800ms → onSave(updated)
- setBusy(false)

UI: fixed fullscreen (#000), zIndex 300, flex column, overflowY auto

Sticky header: close button, "প্রোফাইল সম্পাদনা" title, "সেভ করুন" save button (red bg)

Content (padding "24px 18px 40px"):
- Avatar preview (80x80 circle) centered with "আইকন পরিবর্তন করুন" text below
- Avatar picker: flex wrap of all AVATARS as 44x44 buttons (selected: #FE2C55 border, #1a0a0e bg)
- Display name input
- Username input
- Bio textarea (3 rows)
- Password section (borderTop):
  - "🔑 পাসওয়ার্ড পরিবর্তন" heading
  - Current password input (type password)
  - New password input (type password)
- Error message in #FE2C55 if err

Show Toast overlay.Add the AdminPanel component to the VibeReel artifact.

Props: currentUser, onClose

State: adminTab ("stats"|"users"|"videos"), users [], videos [], loading true, toast, confirmAction (null)

load (useCallback):
- fetch all users (slist "user:", shared true), sort by createdAt desc
- fetch all videos (slist "video:", shared true), sort by createdAt desc

banUser(u): toggle u.banned, sset back, show toast, setConfirmAction(null), reload
verifyUser(u): toggle u.verified, sset back, show toast, reload
deleteVideo(v): sdel(v.id, true), show toast, setConfirmAction(null), reload

totalLikes = sum of all video likes
totalComments = sum of all video comments

UI: fixed fullscreen (#000), zIndex 400, flex column

Toast overlay, confirmAction modal (title + desc + cancel/confirm buttons)

Header: back button, "🛡 অ্যাডমিন প্যানেল" title

Tab bar: "📊 স্ট্যাটস" | "👥 ইউজার" | "🎬 ভিডিও"
Active tab: #FE2C55 bottom border

Content (flex 1, overflowY auto, padding 16):

stats tab:
- 2-column stat cards: total users (#FE2C55), total videos (#25F4EE), total likes (#FE2C55), total comments (#25F4EE)
- "🏆 টপ ক্রিয়েটর" list: top 5 users by total likes, ranked #1-5 with gold/silver/bronze colors, avatar, displayName, like count, verified badge

users tab:
- total count header
- For each user: avatar circle (with 🚫 overlay if banned) + displayName + badges + @username + video count
- If not currentUser: Verify button (toggle, teal color) + Ban/Unban button (red)

videos tab:
- total count header
- 2-column grid of video cards (thumbnail/video/emoji preview, @username, likes+comments, delete button)Add the main App component to the VibeReel artifact. This is the root component — export default function App().

State:
- user (null), tab ("home"), booting (true)
- showUpload (false), uploadKey (0)
- following ({}), liked ({}), likeCounts ({}), bookmarks ({})
- unread (0), profileTarget (null)
- editingProfile (false), showAdmin (false)
- toast via useToast()

Boot useEffect (runs once):
- sget("session", false) → if sess.username exists, fetch user from shared storage
- if user exists and not banned: setUser, load following/liked/bookmarks from personal storage
- setBooting(false)

Unread notification polling useEffect (depends on user):
- async check(): slist notifs, count unread ones, setUnread
- call check() immediately, setInterval every 12000ms, cleanup

handleFollow (useCallback, depends on user, following, showToast):
- toggle following state, persist to "following:"+user.uid (personal)
- update "followers:"+targetUid (shared)
- if now following: create follow notification for target
- showToast success or info

handleLike (useCallback, depends on user, liked):
- toggle liked state, persist to "liked:"+user.uid (personal)
- update video.likes in shared storage (+1 or -1, min 0)
- update likeCounts state
- if newly liked and not own video: create like notification

handleBookmark (useCallback, depends on user, bookmarks, showToast):
- toggle bookmark, persist to "bookmarks:"+user.uid (personal)
- showToast "সেভ হয়েছে 🔖" or "সেভ থেকে সরানো হয়েছে"

handleLogout:
- sset("session", null, false)
- reset user, following, liked, bookmarks, tab

handleOpenProfile(video):
- setProfileTarget({uid, username, displayName, avatar, bio, verified, admin} from video object)

Booting screen: centered #000 div with 🎬 emoji (red glow filter) + "VIBEREEL" text (color #222, letterSpacing 3)

No user: return <AuthScreen onLogin={setUser}/>

TABS array:
- {id:"home", label:"হোম", icon:<IC.Home a={tab==="home"}/>}
- {id:"search", label:"সার্চ", icon:<IC.Search a={tab==="search"}/>}
- {id:"notif", label:"নোটিফ", icon:<IC.Bell a={tab==="notif"} n={unread}/>}
- {id:"profile", label:"প্রোফাইল", icon:<IC.User a={tab==="profile"}/>}

Main render (full height, #000, flex column, overflow hidden, fontFamily system sans-serif):
- Toast overlay
- AdminPanel if showAdmin
- ProfilePage overlay (fixed, zIndex 150) if profileTarget && !showAdmin
- EditProfileScreen if editingProfile
- UploadScreen if showUpload (onUploaded: setUploadKey+1, setTab home)
- Main content div (flex 1, overflowY auto):
  - HomeTab when tab==="home"
  - SearchTab when tab==="search"
  - NotifTab when tab==="notif"
  - ProfilePage (own profile) when tab==="profile"
- Bottom nav (background #060606, borderTop #111, paddingBottom env(safe-area-inset-bottom)):
  - First 2 TABS as icon+label buttons
  - Upload center button: 46x30 red gradient rounded rect with IC.Plus, "আপলোড" label
  - Last 2 TABS as icon+label buttons
- Admin badge button (fixed, bottom 80, right 16) if user.admin: "🛡 Admin"Now wire everything together in the VibeReel artifact. Make sure the full app renders correctly end-to-end:

1. Replace the placeholder render with the actual App component.
2. Ensure all imports at the top are: import { useState, useRef, useEffect, useCallback } from "react";
3. The default export must be: export default function App()
4. Verify the component hierarchy is correct:
   - App → AuthScreen (when no user)
   - App → main layout (when user exists)
   - Main layout contains: HomeTab, SearchTab, NotifTab, ProfilePage (own)
   - Overlays: AdminPanel, ProfilePage (target), EditProfileScreen, UploadScreen
   - VideoCard uses CommentPanel and ShareModal
   - ProfilePage uses UploadScreen (for editing)

5. Confirm all these props are passed correctly:
   - HomeTab gets: currentUser, following, bookmarks, liked, likeCounts, onFollow, onBookmark, onLike, onOpenProfile, refresh
   - VideoCard gets: video, currentUser, liked, bookmarked, likeCount, following, onLike, onBookmark, onFollow, onOpenProfile
   - ProfilePage gets: targetUser, currentUser, following, onFollow, onBack/onEdit/onLogout
   - SearchTab gets: currentUser, following, onFollow
   - NotifTab gets: currentUser, onClear

6. Make sure the app boots, shows a splash screen, then AuthScreen, then main app after login.Polish the VibeReel artifact with these styling and UX fixes:

1. Global styles: Add a <style> tag inside the app with:
   * { box-sizing: border-box; margin: 0; padding: 0; }
   body { background: #000; color: #fff; }
   ::-webkit-scrollbar { display: none; }
   input, textarea, button { font-family: inherit; }

2. Video feed scroll snap: ensure the scroll container has:
   - overflowY: "scroll" (not auto)
   - scrollSnapType: "y mandatory"
   - CSS: -webkit-overflow-scrolling: touch

3. Bottom nav safe area: paddingBottom should use "env(safe-area-inset-bottom, 0px)"

4. Auth splash: ensure the background radial glow div has pointerEvents "none" so buttons work

5. Mobile tap highlight: all interactive elements in VideoCard should have WebkitTapHighlightColor: "transparent"

6. Notification badge on Bell icon: ensure the red badge renders correctly with position absolute, top -5, right -6

7. Heart animation: add the CSS keyframes for heartPop inside a <style> tag within VideoCard if not already present

8. Music disc rotation: ensure the rotating disc uses transform: `rotate(${musicAnim}deg)` directly in the style prop

9. Empty states: all empty states should be vertically centered within their scroll containers using height 100dvh with flex column center

10. Confirm all text content using Bengali (বাংলা) matches the original where specifiedAdd these final features to the VibeReel artifact:

1. First-user admin: In the signup function, check if allUsers (from slist("user:", true)) has length === 0. If so, set isAdmin = true for the new user. This makes the very first registered user an admin automatically.

2. Admin badge visibility: The "🛡 Admin" floating button in the main App should only render if user.admin === true. It should be fixed position, bottom 80, right 16, above the bottom nav.

3. Notification dot on feed: In the bottom nav, the notification tab button should show the unread count via the IC.Bell component's n prop. When the notif tab is opened, call setUnread(0).

4. Profile from video: handleOpenProfile should construct a user-like object from the video's fields (uid, username, displayName, avatar, bio, verified, admin). The ProfilePage overlay should use this object as targetUser.

5. Like count sync: In handleLike, after updating the video in shared storage, call setLikeCounts(prev => ({...prev, [vidId]: vid.likes})). In VideoCard, likeCount prop should override video.likes||0.

6. Bookmark persistence: bookmarks stored as {videoId: true} object in "bookmarks:"+user.uid personal storage. In ProfilePage saved tab, fetch the bookmarked videos from shared storage using the bookmark keys.

7. Following feed: HomeTab "ফলোয়িং" tab filters videos where following[v.uid] is truthy AND v.uid !== currentUser.uid.

8. Comment notification: Only send comment notification if video.uid !== currentUser.uid (don't notify yourself).

9. Video edit: In ProfilePage, the edit button on each video card calls setEditing(v), which shows UploadScreen with editVideo={v}. After save, call load() to refresh.

10. Session restore: On app boot, if session exists and user is not banned, restore following/liked/bookmarks from personal storage.Final review and completion of the VibeReel artifact. Ensure the complete app is working:

CHECKLIST — verify each section exists and is functional:

AUTH:
✅ Splash screen with VibeReel branding
✅ Login with username + password validation
✅ Signup with avatar picker, display name, username, password, bio
✅ First user becomes admin automatically
✅ Banned users cannot login

HOME FEED:
✅ Full-screen vertical scroll snap video feed
✅ "For You" shows all videos, "ফলোয়িং" shows followed users only
✅ Double-tap heart animation on video
✅ Like, Comment, Bookmark, Share, Follow buttons on right sidebar
✅ Music disc rotating animation
✅ Video plays/pauses on tap

UPLOAD:
✅ File picker for video (max 50MB)
✅ Optional thumbnail upload
✅ Caption, hashtags, music picker, emoji theme
✅ Publishes to shared storage, notifies followers

SEARCH:
✅ Trending hashtags display
✅ Search users and videos
✅ Filter by users/videos/tags mode buttons

NOTIFICATIONS:
✅ Shows likes, comments, follows, new videos
✅ Unread red dot badge on bell icon
✅ Marks all as read when tab opened

PROFILE:
✅ Video grid, saved videos tab
✅ Follower/Following/Like counts
✅ Edit and delete own videos
✅ Edit profile (name, username, bio, avatar, password)
✅ Follow/Unfollow other users

ADMIN PANEL:
✅ Stats overview (users, videos, likes, comments)
✅ Top creators leaderboard
✅ Ban/unban users, verify/unverify users
✅ Delete any video

If anything is missing or broken, add or fix it now. The app should be fully functional as a TikTok-like social video platform with shared persistent storage.
