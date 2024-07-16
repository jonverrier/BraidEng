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
from common.Urls import webUrls, countUrlHits
from common.common_functions import ensure_directory_exists
from web.download_html import download_html
from text.enrich_text_chunks import enrich_text_chunks
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
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
def check_content(file_path, source_url):
    logger.info(f"Checking content for source URL: {source_url}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = json.load(f)
        matching_chunks = [chunk for chunk in content if chunk["hitTrackingId"] == source_url]
        logger.info(f"Found {len(matching_chunks)} chunks for source: {source_url}")
        assert matching_chunks, f"Content from source {source_url} not found"
        return matching_chunks
    except Exception as e:
        logger.error(f"Error checking content for {source_url}: {str(e)}")
        raise

# Function to run the entire pipeline of text enrichment processes
def run_pipeline(config, output_dir):
    logger.info(f"Running pipeline for output directory: {output_dir}")
    try:
        enrich_text_chunks(config, output_dir)
        enrich_text_summaries(config, output_dir)
        enrich_text_embeddings(config, output_dir)
        enrich_lite(output_dir)
        logger.info("Pipeline completed successfully")
    except Exception as e:
        logger.error(f"Error running pipeline: {str(e)}")
        raise

# Function to verify the hit counts for the expected number of sources
def verify_hit_counts(output_dir, expected_sources):
    logger.info(f"Verifying hit counts for {expected_sources} expected sources")
    try:
        with open(os.path.join(output_dir, "master_text.json"), "r", encoding="utf-8") as f:
            hit_counts = json.load(f)
        assert len(hit_counts) == expected_sources, f"Expected hit counts for {expected_sources} sources, got {len(hit_counts)}"
        for i, hit in enumerate(hit_counts):
            logger.info(f"Source {i+1} hit count: {hit['hits']}")
            assert hit["hits"] > 0, f"No hits found for source {i+1}. Hit counts: {hit_counts}"
        logger.info("Hit count verification completed successfully")
    except Exception as e:
        logger.error(f"Error verifying hit counts: {str(e)}")
        raise

# Test case for the web pipeline
def test_web_pipeline(test_output_dir, config):
    logger.info("Starting web pipeline test")

    source1 = webUrls[0]  # First source URL
    source2 = webUrls[1]  # Second source URL  

    try:
        # Source 1: Download and run the pipeline
        logger.info(f"Downloading and processing source 1: {source1[1]}")
        download_html(source1[1], source1[2], test_output_dir, config.discardIfBelow)
        run_pipeline(config, test_output_dir)

        logger.info("Checking content from source 1")
        master_text_path = os.path.join(test_output_dir, "output", "master_text.json")
        source1_chunks = check_content(master_text_path, source1[1])

        # Source 2: Add another source and run the pipeline again
        logger.info(f"Downloading and processing source 2: {source2[1]}")
        download_html(source2[1], source2[2], test_output_dir, config.discardIfBelow)
        run_pipeline(config, test_output_dir)

        logger.info("Checking content from both sources")
        source1_chunks = check_content(master_text_path, source1[1])
        source2_chunks = check_content(master_text_path, source2[1])

        # Count URL hits
        test_webUrls = [source1, source2]
        logger.info("Counting URL hits")
        countUrlHits(test_output_dir, test_webUrls, "master_text.json")

        # Verify the hit counts
        verify_hit_counts(test_output_dir, 2)  # Expect 2 sources with hits           

        logger.info("Web pipeline test completed successfully")

    except Exception as e:
        logger.error(f"Web pipeline test failed: {str(e)}")
        raise

    logger.info("Web pipeline test completed")
