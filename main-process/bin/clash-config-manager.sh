#!/usr/bin/env bash
#
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.

function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }

# .app/Contents/Resources/clash-config-manager.sh
# ..
CONTENTS="$(dirname "$(dirname "$(realpath "$0")")")"
BIN="$CONTENTS/MacOS/clash-config-manager"
CCM_RUN_MODE="cli" "$BIN" "$@"
exit $?
