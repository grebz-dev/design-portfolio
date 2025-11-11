<?php
namespace Grav\Theme;

use Grav\Common\Theme;
use RocketTheme\Toolbox\Event\Event;

class DesignPortfolio extends Theme
{
    /**
     * Initialize theme and subscribe to events
     */
    public static function getSubscribedEvents()
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0],
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
        ];
    }

    /**
     * Initialize theme
     */
    public function onThemeInitialized()
    {
        // Generate favicon if custom logo exists and favicon doesn't
        $this->generateFavicon();
    }

    /**
     * Add custom variables to Twig
     */
    public function onTwigSiteVariables()
    {
        // Check if favicon exists
        $faviconPath = 'user/themes/design-portfolio/images/favicon.ico';
        $this->grav['twig']->twig_vars['has_favicon'] = file_exists(GRAV_ROOT . '/' . $faviconPath);
    }

    /**
     * Generate favicon from custom logo
     */
    protected function generateFavicon()
    {
        $config = $this->config();
        $customLogo = $config['custom_logo'] ?? null;

        if (!$customLogo) {
            return;
        }

        // Handle array or single file
        $logoFile = is_array($customLogo) ? reset($customLogo) : $customLogo;
        
        if (!$logoFile || !isset($logoFile['name'])) {
            return;
        }

        $themePath = 'user/themes/design-portfolio';
        $logoPath = GRAV_ROOT . '/' . $themePath . '/images/' . $logoFile['name'];
        $faviconDir = GRAV_ROOT . '/' . $themePath . '/images';
        
        // Check if logo file exists
        if (!file_exists($logoPath)) {
            return;
        }

        // Generate favicons if they don't exist or logo is newer
        $faviconIco = $faviconDir . '/favicon.ico';
        $favicon16 = $faviconDir . '/favicon-16x16.png';
        $favicon32 = $faviconDir . '/favicon-32x32.png';
        $favicon180 = $faviconDir . '/apple-touch-icon.png';

        $logoModTime = filemtime($logoPath);
        $needsRegeneration = !file_exists($faviconIco) || 
                             (file_exists($faviconIco) && filemtime($faviconIco) < $logoModTime);

        if ($needsRegeneration) {
            $this->createFavicons($logoPath, $faviconDir);
        }
    }

    /**
     * Create favicons from source image
     */
    protected function createFavicons($sourcePath, $outputDir)
    {
        // Get image info
        $imageInfo = getimagesize($sourcePath);
        if (!$imageInfo) {
            return;
        }

        // Load source image
        $sourceImage = null;
        switch ($imageInfo[2]) {
            case IMAGETYPE_JPEG:
                $sourceImage = imagecreatefromjpeg($sourcePath);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = imagecreatefrompng($sourcePath);
                break;
            case IMAGETYPE_GIF:
                $sourceImage = imagecreatefromgif($sourcePath);
                break;
            default:
                return;
        }

        if (!$sourceImage) {
            return;
        }

        // Generate different sizes
        $sizes = [
            'favicon-16x16.png' => 16,
            'favicon-32x32.png' => 32,
            'apple-touch-icon.png' => 180,
            'favicon.ico' => 32 // We'll create a 32x32 PNG then convert to ICO
        ];

        foreach ($sizes as $filename => $size) {
            $resized = imagecreatetruecolor($size, $size);
            
            // Preserve transparency
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
            imagefill($resized, 0, 0, $transparent);
            imagealphablending($resized, true);

            // Resize image
            imagecopyresampled(
                $resized, $sourceImage,
                0, 0, 0, 0,
                $size, $size,
                imagesx($sourceImage), imagesy($sourceImage)
            );

            // Save as PNG
            $outputPath = $outputDir . '/' . $filename;
            if ($filename === 'favicon.ico') {
                // For ICO, save as PNG first
                imagepng($resized, $outputDir . '/favicon-temp.png');
                // Convert PNG to ICO using a simple method
                $this->convertPngToIco($outputDir . '/favicon-temp.png', $outputPath);
                @unlink($outputDir . '/favicon-temp.png');
            } else {
                imagepng($resized, $outputPath);
            }

            imagedestroy($resized);
        }

        imagedestroy($sourceImage);
    }

    /**
     * Convert PNG to ICO format
     */
    protected function convertPngToIco($pngPath, $icoPath)
    {
        // Simple ICO file creation
        // For a more robust solution, consider using a library
        
        // For now, just copy the 32x32 PNG as favicon.png and create a basic ICO
        if (file_exists($pngPath)) {
            // Read PNG data
            $pngData = file_get_contents($pngPath);
            $pngSize = strlen($pngData);
            
            // Create ICO header
            $ico = '';
            $ico .= pack('v', 0); // Reserved
            $ico .= pack('v', 1); // Type (1 = ICO)
            $ico .= pack('v', 1); // Number of images
            
            // Image directory entry
            $ico .= pack('C', 32); // Width
            $ico .= pack('C', 32); // Height
            $ico .= pack('C', 0);  // Color palette
            $ico .= pack('C', 0);  // Reserved
            $ico .= pack('v', 1);  // Color planes
            $ico .= pack('v', 32); // Bits per pixel
            $ico .= pack('V', $pngSize); // Size of image data
            $ico .= pack('V', 22); // Offset to image data
            
            // Append PNG data
            $ico .= $pngData;
            
            file_put_contents($icoPath, $ico);
        }
    }
}
