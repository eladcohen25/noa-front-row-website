# Lookbook Assets

Place your lookbook assets in the following structure:

```
/public/lookbook/
├── hero-video.mp4          # Main hero video (recommended: 1920x1080, h264, ~30-60 seconds)
├── hero-poster.jpg         # Poster/thumbnail for the hero video (1920x1080)
├── runway/                 # Runway look images
│   ├── look-01.jpg         # Portrait orientation recommended (3:4 ratio)
│   ├── look-02.jpg
│   ├── look-03.jpg
│   ├── look-04.jpg
│   ├── look-05.jpg
│   ├── look-06.jpg
│   ├── look-07.jpg
│   ├── look-08.jpg
│   ├── look-09.jpg
│   ├── look-10.jpg
│   ├── look-11.jpg
│   └── look-12.jpg
├── fittings/               # Behind-the-scenes fitting images
│   ├── fitting-01.jpg      # Portrait orientation (4:5 ratio recommended)
│   └── fitting-02.jpg
└── details/                # Detail/close-up shots
    ├── detail-01.jpg       # Any aspect ratio works, will be displayed at consistent height
    ├── detail-02.jpg
    ├── detail-03.jpg
    ├── detail-04.jpg
    ├── detail-05.jpg
    ├── detail-06.jpg
    └── detail-07.jpg
```

## Image Recommendations

### Hero Video
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 (16:9 aspect ratio)
- Duration: 30-60 seconds recommended
- File size: Keep under 20MB for fast loading

### Hero Poster
- Format: JPG
- Resolution: 1920x1080
- This displays before the video loads

### Runway Images
- Format: JPG
- Aspect ratio: 3:4 (portrait) recommended
- Resolution: At least 800x1067 for good quality
- 12 images will fill two rows on desktop (6 per row)

### Fittings Images
- Format: JPG
- Aspect ratio: 4:5 (portrait) recommended
- Resolution: At least 1200x1500
- Only 2 images are used (side-by-side on desktop)

### Details Images
- Format: JPG
- Any aspect ratio works (will be displayed at consistent height)
- Resolution: At least 800px height
- 7 images recommended for the horizontal scroll gallery

## Updating Content

To update the text content (titles, dates, editorial statement), edit the `lookbookData` object in:
`/app/lookbook/page.tsx`

To add more images to any section, add entries to the corresponding arrays in the same file.
