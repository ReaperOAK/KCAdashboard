#!/bin/bash
# Apply git config for this repository
git config pull.rebase false
# Then perform pull
git pull origin build
