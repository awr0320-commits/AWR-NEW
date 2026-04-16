
import re

def check_tags(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Very simple regex to find <tag and </tag
    # This won't handle everything (like fragments <>, comments, strings) but it's a start
    opens = re.findall(r'<([a-zA-Z.]+)', content)
    closes = re.findall(r'</([a-zA-Z.]+)', content)
    self_closing = re.findall(r'<([a-zA-Z.]+)[^>]*/>', content)
    
    # Filter out self-closing from opens if they were caught
    # (Actually better to use a stack)
    
    stack = []
    # More precise logic: find all <tag, /> and </tag
    tokens = re.findall(r'</?[a-zA-Z.]+|/>', content)
    
    errors = []
    for token in tokens:
        if token == '/>':
            if stack:
                stack.pop()
        elif token.startswith('</'):
            tag = token[2:]
            if not stack:
                errors.append(f"Unexpected close tag: {token}")
            else:
                last_tag = stack.pop()
                if last_tag != tag:
                    errors.append(f"Mismatched tag: expected </{last_tag}>, found {token}")
        else:
            tag = token[1:]
            stack.append(tag)
            
    if stack:
        errors.append(f"Unclosed tags: {stack}")
        
    return errors

if __name__ == "__main__":
    import sys
    res = check_tags('/Users/yangyihong/Downloads/awr/src/App.tsx')
    for e in res:
        print(e)
