# Copyright (c) 2024 Braid Technologies Ltd

# Standard Library Imports
import pytest
import os
import json
import shutil
import sys
import logging

# Set up logging to display information about the execution of the script
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the project root and scripts directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
scripts_dir = os.path.join(project_root, 'scripts')
sys.path.extend([project_root, scripts_dir])

# Import necessary modules from the project
from common.ApiConfiguration import ApiConfiguration
from common.Urls import youTubeUrls, countUrlHits
from common.common_functions import ensure_directory_exists
from youtube.download_transcripts import download_transcripts
from youtube.enrich_transcript_chunks import enrich_transcript_chunks
from youtube.enrich_transcript_summaries import enrich_transcript_summaries
from youtube.enrich_transcript_embeddings import enrich_transcript_embeddings
from text.enrich_lite import enrich_lite

# Fixture to create a temporary directory for test output
@pytest.fixture
def test_output_dir(tmpdir):
    dir_path = tmpdir.mkdir("test_output")
    logger.info(f"Created temporary test output directory: {dir_path}")
    yield str(dir_path)
    # Clean up after the test
    logger.info(f"Cleaning up test output directory: {dir_path}")
    shutil.rmtree(str(dir_path))

# Fixture to create an instance of ApiConfiguration
@pytest.fixture
def config():
    logger.info("Creating ApiConfiguration instance")
    return ApiConfiguration()

# Function to check if the content from a source URL is present in the specified file
def check_content(file_path, source_id):
    logger.info(f"Checking content for source ID: {source_id}")
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Could not find master_enriched.json at {file_path}")
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = json.load(f)
        
        if not content:
            logger.warning(f"File {file_path} is empty")
            return []

        # Log the structure of the first few items for debugging
        logger.info(f"Sample content structure: {json.dumps(content[:2], indent=2)}")
        
        # Check for sourceId or any other potential identifier
        matching_chunks = [
            chunk for chunk in content 
            if chunk.get("sourceId") == source_id or
               chunk.get("playlistId") == source_id or
               chunk.get("hitTrackingId") == source_id
        ]
        
        logger.info(f"Found {len(matching_chunks)} chunks for source: {source_id}")
        
        if not matching_chunks:
            # Log all unique identifiers in the content for debugging
            unique_ids = set(
                chunk.get("sourceId") or chunk.get("playlistId") or chunk.get("hitTrackingId")
                for chunk in content
            )
            logger.warning(f"Available unique identifiers in content: {unique_ids}")
        
        return matching_chunks
    except Exception as e:
        logger.error(f"Error checking content for {source_id}: {str(e)}")
        raise

# Function to run the entire pipeline of transcript enrichment processes
def run_pipeline(config, output_dir):
    logger.info(f"Running pipeline for output directory: {output_dir}")
    try:
        logger.info("Starting enrich_transcript_chunks")
        enrich_transcript_chunks(config, output_dir)
        logger.info("Completed enrich_transcript_chunks")

        logger.info("Starting enrich_transcript_summaries")
        enrich_transcript_summaries(config, output_dir)
        logger.info("Completed enrich_transcript_summaries")

        logger.info("Starting enrich_transcript_embeddings")
        enrich_transcript_embeddings(config, output_dir)
        logger.info("Completed enrich_transcript_embeddings")

        logger.info("Starting enrich_lite")
        enrich_lite(output_dir)
        logger.info("Completed enrich_lite")

        logger.info("Pipeline completed successfully")
    except Exception as e:
        logger.error(f"Error running pipeline: {str(e)}", exc_info=True)
        raise

# Function to verify the hit counts for the expected number of sources
def verify_hit_counts(output_dir, expected_sources):
    logger.info(f"Verifying hit counts for {expected_sources} expected sources")
    try:
        with open(os.path.join(output_dir, "hit_test_results.json"), "r", encoding="utf-8") as f:
            hit_counts = json.load(f)
        
        assert len(hit_counts) == expected_sources, f"Expected hit counts for {expected_sources} sources, got {len(hit_counts)}"
        
        for i, hit in enumerate(hit_counts):
            logger.info(f"Source {i+1} ({hit['path']}) hit count: {hit['hits']}")
            assert hit['hits'] > 0, f"No hits found for source {hit['path']}. Hit counts: {hit_counts}"
        
        logger.info("Hit count verification completed successfully")
    except Exception as e:
        logger.error(f"Error verifying hit counts: {str(e)}")
        raise


def test_youtube_pipeline(tmp_path, config: ApiConfiguration):
    logger.info("Starting YouTube pipeline test")

    # Create a new directory for test output
    test_output_dir = os.path.join(str(tmp_path), "test_output")
    os.makedirs(test_output_dir, exist_ok=True)
    logger.info(f"Created test output directory: {test_output_dir}")

    # Clean contents (in case of a failed previous run)
    for item in os.listdir(test_output_dir):
        item_path = os.path.join(test_output_dir, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)
    logger.info("Cleaned test output directory")

    source1 = youTubeUrls[0]  # First source URL
    source2 = youTubeUrls[1]  # Second source URL

    logger.info(f"Source 1: {source1}")
    logger.info(f"Source 2: {source2}")

    try:
        # Download source 1 and run the whole pipeline
        logger.info(f"Downloading and processing source 1: {source1[1]}")
        logger.info(f"Transcript destination directory: {test_output_dir}")
        download_transcripts(source1[1], test_output_dir)
        run_pipeline(config, test_output_dir)

        # Load JSON output and confirm content from source 1
        master_enriched_path = os.path.join(test_output_dir, "output", "master_enriched.json")
        source1_chunks = check_content(master_enriched_path, source1[1])
        assert source1_chunks, f"No content found for source 1: {source1[1]}"
        logger.info("Confirmed content from source 1")

        # Add source 2 and run the whole pipeline again
        logger.info(f"Downloading and processing source 2: {source2[1]}")
        logger.info(f"Transcript destination directory: {test_output_dir}")
        download_transcripts(source2[1], test_output_dir)
        run_pipeline(config, test_output_dir)

        # Load JSON output and confirm content from both sources
        source1_chunks = check_content(master_enriched_path, source1[1])
        source2_chunks = check_content(master_enriched_path, source2[1])
        assert source1_chunks, f"No content found for source 1: {source1[1]}"
        assert source2_chunks, f"No content found for source 2: {source2[1]}"
        logger.info("Confirmed content from both sources")

        # Count URL hits
        test_youTubeUrls = [source1, source2]
        logger.info("Counting URL hits")
        output_dir = os.path.join(test_output_dir, "output")
        countUrlHits(output_dir, test_youTubeUrls, "master_enriched.json", "hit_test_results.json")

        # Verify the hit counts
        verify_hit_counts(output_dir, 2)  # Expect 2 sources with hits

        logger.info("YouTube pipeline test completed successfully")

    except Exception as e:
        logger.error(f"YouTube pipeline test failed: {str(e)}")
        raise

    finally:
        # Clean up by deleting the test output directory and all files
        shutil.rmtree(test_output_dir)
        logger.info(f"Cleaned up test output directory: {test_output_dir}")

    logger.info("YouTube pipeline test completed")

if __name__ == "__main__":
    pytest.main([__file__])