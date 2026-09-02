#!/bin/bash
# Post-build script to clean up large cache files before deployment

echo "Cleaning up Next.js cache files..."

# Remove webpack cache (can be 200MB+)
if [ -d ".next/cache" ]; then
  echo "Removing .next/cache directory..."
  rm -rf .next/cache
  echo "Cache removed successfully"
fi

# Show final build size
echo "Final .next directory size:"
du -sh .next

echo "Build cleanup complete!"
