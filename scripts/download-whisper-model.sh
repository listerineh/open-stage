#!/bin/bash

# Download Whisper GGML models for browser transcription
# Models from: https://huggingface.co/ggerganov/whisper.cpp

MODEL_DIR="public/models"
mkdir -p $MODEL_DIR

echo "Downloading Whisper tiny model (quantized)..."
curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin" \
  -o "$MODEL_DIR/ggml-tiny-q5_1.bin"

echo "Done! Model saved to $MODEL_DIR/ggml-tiny-q5_1.bin"
echo ""
echo "Optional: Download larger models for better accuracy:"
echo "  - base: curl -L 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin' -o '$MODEL_DIR/ggml-base-q5_1.bin'"
echo "  - small: curl -L 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin' -o '$MODEL_DIR/ggml-small-q5_1.bin'"
