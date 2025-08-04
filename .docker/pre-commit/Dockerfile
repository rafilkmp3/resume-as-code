FROM alpine:3.19

# Install required tools
RUN apk add --no-cache \
    bash \
    git \
    python3 \
    py3-pip \
    nodejs \
    npm \
    curl \
    jq \
    yamllint

# Install Node.js packages globally
RUN npm install -g \
    ajv-cli \
    js-yaml \
    jsonlint

# Install Python packages
RUN pip3 install --no-cache-dir \
    PyYAML \
    jsonschema

# Create workspace
WORKDIR /workspace

# Copy validation scripts
COPY scripts/ /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/pre-commit-validation.sh"]