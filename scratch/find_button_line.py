
import re

def find_unclosed_button(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    content = "".join(lines)
    # Remove strings and comments to avoid false positives
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    
    stack = []
    # Find <button or </button or />
    # We use finditer to get positions
    for m in re.finditer(r'<(button)|</(button)>|(/)>', content):
        if m.group(1): # <button
            # Find line number
            line_no = content.count('\n', 0, m.start()) + 1
            stack.append((line_no, m.group(0)))
        elif m.group(2): # </button>
            if not stack:
                line_no = content.count('\n', 0, m.start()) + 1
                print(f"Unexpected </button> at line {line_no}")
            else:
                stack.pop()
        elif m.group(3): # />
            # This is tricky as any self-closing tag ends with />
            # But in this file, buttons are usually not self-closing
            pass
            
    for line_no, tag in stack:
        print(f"Unclosed {tag} starting at line {line_no}")

if __name__ == "__main__":
    find_unclosed_button('/Users/yangyihong/Downloads/awr/src/App.tsx')
