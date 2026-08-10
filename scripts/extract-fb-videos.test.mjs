import { describe, it, expect } from 'vitest';
import { buildOutputFilename } from './extract-fb-videos.mjs';

describe('buildOutputFilename', () => {
  it('maps a known source path to its target name', () => {
    const result = buildOutputFilename(
      "this_profile's_activity_across_facebook/posts/media/videos/1041231161493966.mp4",
      { 'this_profile\'s_activity_across_facebook/posts/media/videos/1041231161493966.mp4': 'under-pressure.mp4' }
    );
    expect(result).toBe('under-pressure.mp4');
  });

  it('returns null for a source path not in the selection map', () => {
    const result = buildOutputFilename('some/other/path.mp4', {});
    expect(result).toBeNull();
  });
});
