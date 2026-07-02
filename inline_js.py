import os
import re
import sys

def inline_js(html_path, repo_root):
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html = f.read()
            
        modified = False
        
        # Regex to find <script src="/js/..."></script>
        pattern = re.compile(r'<script\s+src=["\']/js/([^"\']+\.js)["\']\s*></script>')
        
        def repl(match):
            nonlocal modified
            js_filename = match.group(1)
            js_path = os.path.join(repo_root, 'js', js_filename)
            
            if os.path.exists(js_path):
                with open(js_path, 'r', encoding='utf-8') as js_file:
                    js_content = js_file.read()
                print(f"Inlining {js_filename} into {os.path.basename(html_path)}")
                modified = True
                return f'<script>\n{js_content}\n</script>'
            else:
                print(f"Warning: {js_filename} not found at {js_path}")
                return match.group(0)
                
        new_html = pattern.sub(repl, html)
        
        if modified:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(new_html)
                
    except Exception as e:
        print(f"Error processing {html_path}: {e}")

def main():
    repo_root = '/Users/dharamdaxini/Downloads/via/viadecide'
    
    # Process all HTML files in viadecide and subdirectories
    for root, dirs, files in os.walk(repo_root):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
            
        for file in files:
            if file.endswith('.html'):
                html_path = os.path.join(root, file)
                inline_js(html_path, repo_root)

if __name__ == "__main__":
    main()
