#!/bin/bash

set -eu

for filepath in overlays/*
do
    echo "kustomize build $filepath"
    kustomize build $filepath > /dev/null
done
