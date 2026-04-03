import { Filter } from 'bad-words';

// Create a new instance with default configurations
const filter = new Filter();

// You can add custom words to the blocklist if needed
// filter.addWords('someCustomBadWord');

export const isCleanContent = (text) => {
    if (!text) return true;
    // We remove HTML tags first so it doesn't accidentally think `<script>` is a bad word if we add custom filters
    const cleanText = text.replace(/<[^>]+>/g, '');
    return !filter.isProfane(cleanText);
};

export default filter;
