---
name: downloading-videos
description: Downloads videos from various internet platforms using yt-dlp. Use when the user provides a URL to a video (YouTube, X, Instagram, etc.) and asks to download, save, or extract audio from it.
---

# Video Downloader Skill

Download videos, extract audio, and manage playlists from 1000+ supported sites using the `yt-dlp` industrial-grade downloader.

## When to use this skill

- User provides a link to a video (YouTube, X, Instagram, TikTok, etc.)
- User wants to "save," "download," or "keep" a video from the internet
- User wants to extract audio/MP3 from a video URL
- User wants to download an entire playlist or channel

## Workflow

1.  **Validate URL**: Ensure the URL is valid and from a supported platform. 
2.  **Inspect Metadata**: (Optional) Use `--dump-json` or `-F` to check available formats if the user requests specific quality.
3.  **Confirm Target Directory**: **CRITICAL**: Always ask the user exactly where they want to save the video before downloading it, unless they have explicitly provided a target directory. Do not default to a scratch or internal directory without their permission.
4.  **Execute Download**: Run the appropriate `yt-dlp` command and output the file to the user-specified directory using the `-o` flag.
5.  **Confirm Output**: Verify the file was created in the correct target directory.

## Instructions

### 1. Basic Download (Best Quality)

Downloads the best video and best audio and merges them into a single file (usually .mp4 or .mkv).

```bash
./skills/downloading-videos/yt-dlp.exe "URL"
```

### 2. Specify Format & Quality

To force a specific format (e.g., MP4) or resolution:

```bash
# Download best MP4 available
./skills/downloading-videos/yt-dlp.exe -f "bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv+ba/b" "URL"

# List all available formats
./skills/downloading-videos/yt-dlp.exe -F "URL"
```

### 3. Extract Audio (MP3)

Converts the video to a high-quality MP3 (requires ffmpeg, which is installed).

```bash
./skills/downloading-videos/yt-dlp.exe -x --audio-format mp3 --audio-quality 0 "URL"
```

### 4. Custom Output Names

Use templates to rename files automatically. Useful for avoiding collisions.

```bash
# Format: Title (ID).extension
./skills/downloading-videos/yt-dlp.exe -o "%(title)s (%(id)s).%(ext)s" "URL"
```

### 5. Playlists

- **Specific range**: `--playlist-start 1 --playlist-end 10`
- **Reverse order**: `--playlist-reverse`
- **Metadata only**: `--flat-playlist` (downloads nothing, just lists titles)

### 6. Authentication (For private/restricted videos)

If a video requires a login (e.g., Instagram or private YouTube):

```bash
# Use cookies from a browser (chrome, firefox, edge, etc.)
./skills/downloading-videos/yt-dlp.exe --cookies-from-browser chrome "URL"
```

## Troubleshooting

- **"yt-dlp is up to date"**: `yt-dlp` changes frequently to keep up with site updates. If a download fails, try `./yt-dlp.exe -U` to update.
- **FFmpeg errors**: Ensure `ffmpeg` is in the PATH. If not, point to it using `--ffmpeg-location`.
- **403 Forbidden**: Usually means the site detected the bot. Try using `--cookies-from-browser` or `--user-agent`.

## Resources

- [Official Documentation](https://github.com/yt-dlp/yt-dlp#usage-and-options)
- [Supported Sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)
