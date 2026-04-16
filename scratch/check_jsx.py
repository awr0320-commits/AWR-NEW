import re

def check_jsx_balance(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Simple regex to find tags, ignoring comments and strings as much as possible
    tag_pattern = r'<(/?)([A-Z0-9][a-zA-Z0-9\.]+|div|nav|footer|header|main|section|ul|li|span|button|input|label|a|motion\.[a-z]+|AnimatePresence|Markdown|ClothingImage)(?![a-zA-Z0-9])'
    
    # We also need to handle self-closing tags: <Tag />
    tags = []
    
    # Use a more sophisticated approach to find tags and their indices
    in_string = None
    in_comment = False
    
    i = 0
    while i < len(content):
        # Handle comments
        if not in_string:
            if content[i:i+2] == '//':
                i = content.find('\n', i)
                continue
            if content[i:i+2] == '/*':
                in_comment = True
                i += 2
                continue
            if in_comment:
                if content[i:i+2] == '*/':
                    in_comment = False
                    i += 2
                else:
                    i += 1
                continue
        
        # Handle strings
        if not in_comment:
            if content[i] in ['"', "'", '`'] and (i == 0 or content[i-1] != '\\'):
                if in_string == content[i]:
                    in_string = None
                elif in_string is None:
                    in_string = content[i]
                i += 1
                continue
        
        if in_string or in_comment:
            i += 1
            continue
            
        # Match tag
        if content[i] == '<':
            match = re.match(tag_pattern, content[i:])
            if match:
                is_closing = match.group(1) == '/'
                tag_name = match.group(2)
                
                # Check for self-closing: scan for sequence before next tag
                is_self_closing = False
                j = i + match.end()
                bracket_depth = 1 # We are inside a tag <...
                while j < len(content):
                    if content[j] == '>':
                        bracket_depth -= 1
                        if bracket_depth == 0:
                            if content[j-1] == '/':
                                is_self_closing = True
                            break
                    elif content[j] == '<':
                        # This shouldn't happen in a valid tag unless it's a component or something weird
                        # but let's assume it's a break
                        break
                    elif content[j] == '{':
                        bracket_depth += 1
                    elif content[j] == '}':
                        bracket_depth -= 1
                    j += 1
                
                line_no = content.count('\n', 0, i) + 1
                if not is_self_closing:
                    if is_closing:
                        if not tags:
                            print(f"Error: Unexpected closing tag </{tag_name}> at line {line_no}")
                        else:
                            last_tag, last_line = tags.pop()
                            if last_tag != tag_name:
                                print(f"Error: Mismatched tag. Opened <{last_tag}> at line {last_line}, closed </{tag_name}> at line {line_no}")
                                # Put it back to try to find the actual match
                                tags.append((last_tag, last_line))
                    else:
                        tags.append((tag_name, line_no))
                
                i = j + 1
                continue
        
        i += 1
    
    for tag, line in tags:
        print(f"Error: Unclosed tag <{tag}> opened at line {line}")

if __name__ == "__main__":
    print("Checking App.tsx...")
    check_jsx_balance('/Users/yangyihong/Downloads/awr/src/App.tsx')
